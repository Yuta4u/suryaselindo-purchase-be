const { list_pos, list_po_items, products, suppliers } = require('../../models')
const { Op, col, literal, fn } = require('sequelize')
const { HexaColor } = require('../utils/hexa-color')
const { AsyncHandler } = require('../utils/async-handler')
const { ErrorAppHandler } = require('../utils/error-handler')
const { ValidateReport } = require('../helpers/report.helpers')
const SuccessHandler = require('../utils/success-handler')

const MONTHS = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'July',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
]

// ========================== HANDLE GET TOP SPENDING AMOUNT ==============================
exports.TopSpendingAmount = AsyncHandler(async (req, res) => {
  const { usd, eur, cny, jpy, startDate, endDate } = req.query

  ValidateReport(req.query)

  if (startDate.split('-')[0] !== endDate.split('-')[0]) {
    throw ErrorAppHandler('This feature only supports the same year.', 403)
  }

  const numUsd = parseInt(usd.replace(/\./g, ''), 10)
  const numEur = parseInt(eur.replace(/\./g, ''), 10)
  const numCny = parseInt(cny.replace(/\./g, ''), 10)
  const numJpy = parseInt(jpy.replace(/\./g, ''), 10)

  const start_date = new Date(startDate)
  const end_date = new Date(endDate)

  if (isNaN(start_date) || isNaN(end_date)) {
    throw ErrorAppHandler('Invalid start or end date format')
  }

  end_date.setHours(23, 59, 59)

  const results = await list_po_items.findAll({
    attributes: [
      [
        literal(`
            SUM(CASE 
              WHEN product.currency = 'IDR' THEN 
                total_price
              ELSE 
                total_price * CASE 
                  WHEN product.currency = 'USD' THEN ${numUsd}
                  WHEN product.currency = 'EUR' THEN ${numEur}
                  WHEN product.currency = 'CNY' THEN ${numCny}
                  WHEN product.currency = 'JPY' THEN ${numJpy}
                  ELSE 1
                END
            END)`),
        'total_amount',
      ],
      [fn('DATE', col('list_po_items.updated_at')), 'approved_at'],
      [col('list_po.name'), 'original_supplier'],
      [col('list_po.supplier_id'), 'supplier_id'],
    ],
    where: {
      approved: 1,
      updated_at: {
        [Op.between]: [start_date, end_date],
      },
    },
    include: [
      {
        model: list_pos,
        required: true,
        where: { approved: 1 },
        attributes: [],
      },
      {
        model: products,
        required: true,
        attributes: [],
      },
    ],
    group: ['list_po_items.updated_at', 'list_po.name', 'list_po.supplier_id'],
    order: [[literal('total_amount'), 'DESC']],
    raw: true,
  })
  // sm = start date month
  const sm = startDate.split('-')[1]
  // em = end date month
  const em = endDate.split('-')[1]
  const labels = MONTHS.slice(Number(sm) - 1, Number(em))

  if (results.length !== 0) {
    const range = Number(em) - Number(sm) + 1
    const totalPo = {
      label: 'Total Po',
      data: new Array(range).fill(null),
      backgroundColor: '#A6AEBF',
      stack: 'Stack 0',
    }

    let groupByMonth = labels.reduce((acc, item, index) => {
      // dt = results data
      const monthData = results.filter((dt) => {
        const m = MONTHS[Number(dt.approved_at.split('-')[1]) - 1]
        if (item === m) {
          // count total po per month
          totalPo.data[index] += 1
          return dt
        }
      })

      let groupBySupplier = []

      // md = month data
      monthData.forEach((md) => {
        const index = groupBySupplier.findIndex(
          (d) => d.supplier_id === md.supplier_id
        )
        const mdTotalAmount = Number(md.total_amount)
        if (index === -1) {
          groupBySupplier.push({
            ...md,
            total_amount: mdTotalAmount,
          })
        } else {
          groupBySupplier[index].total_amount =
            Number(groupBySupplier[index].total_amount) + mdTotalAmount
        }
      })

      // sorting by higest total amount
      groupBySupplier.sort((a, b) => b.total_amount - a.total_amount)

      const otherData = groupBySupplier.slice(5).reduce((otherAcc, item) => {
        const top5supId = groupBySupplier
          .slice(0, 5)
          .reduce((top5Acc, top5Item) => {
            top5Acc.push(top5Item.supplier_id)
            return top5Acc
          }, [])

        otherAcc['total_amount'] = otherAcc.total_amount
          ? otherAcc.total_amount + item.total_amount
          : item.total_amount
        otherAcc['approved_at'] = item.approved_at
        otherAcc['original_supplier'] = 'Others'
        otherAcc['supplier_id'] = top5supId
        return otherAcc
      }, {})

      // filter
      const fixGroupSupplier = [
        otherData,
        ...groupBySupplier.slice(0, 5),
      ].reduce((acc, dt) => {
        if (dt?.total_amount) {
          acc.push({
            ...dt,
            stack: 'Stack 1',
          })
        }
        return acc
      }, [])

      groupBySupplier = fixGroupSupplier
      acc[item] = groupBySupplier
      return acc
    }, {})

    const outputData = Object.values(groupByMonth).reduce(
      (acc, item, index) => {
        item.forEach((e) => {
          const indexExistData = acc.findIndex(
            (z) => z.label === e.original_supplier
          )
          if (indexExistData === -1) {
            const newData = {
              label: e.original_supplier,
              data: new Array(range).fill(null),
              backgroundColor: HexaColor[acc.length + 1],
              supplier_id: e.supplier_id,
              stack: e.stack,
            }
            newData.data[index] = Math.round(e.total_amount / 1000000)
            acc.push(newData)
          } else {
            if (e.original_supplier === 'Others') {
              acc[indexExistData].supplier_id = [
                acc[indexExistData].supplier_id,
                e.supplier_id,
              ]
            }
            acc[indexExistData].data[index] =
              acc[indexExistData].data[index] +
              Math.round(e.total_amount / 1000000)
          }
        })
        return acc
      },
      []
    )
    return SuccessHandler(res, 'Successfully! get top spending amount report', {
      labels,
      datasets: [totalPo, ...outputData],
    })
  } else {
    return SuccessHandler(res, 'Success! No data found', {})
  }
})

// ========================== HANDLE GET DETAIL TOP SPENDING AMOUNT ==============================
exports.GetDetailTopSpendingAmount = AsyncHandler(async (req, res) => {
  const { supplierId, month, usd, eur, cny, jpy, startDate, endDate } =
    req.query

  const indexMonth = (MONTHS.findIndex((m) => m === month) + 1)
    .toString()
    .padStart(2, '0')

  const start_date = new Date(
    startDate.split('-')[1] === indexMonth
      ? startDate
      : `${endDate.split('-')[0]}-${indexMonth}-01`
  )
  const end_date = new Date(
    endDate.split('-')[1] == indexMonth
      ? endDate
      : `${endDate.split('-')[0]}-${indexMonth}-31`
  )

  if (isNaN(start_date) || isNaN(end_date)) {
    throw ErrorAppHandler('Invalid start or end date format.', 400)
  }

  end_date.setHours(23, 59, 59)

  const numUsd = parseInt(usd.replace(/\./g, ''), 10)
  const numEur = parseInt(eur.replace(/\./g, ''), 10)
  const numCny = parseInt(cny.replace(/\./g, ''), 10)
  const numJpy = parseInt(jpy.replace(/\./g, ''), 10)

  const fixSupplierId =
    supplierId && supplierId.includes(',') ? supplierId.split(',') : supplierId

  const result = await list_po_items.findAll({
    attributes: [
      'quantity',
      [
        literal(`
            SUM(CASE 
              WHEN product.currency = 'IDR' THEN 
                list_po_items.price 
              ELSE 
                list_po_items.price * CASE 
                  WHEN product.currency = 'USD' THEN ${numUsd}
                  WHEN product.currency = 'EUR' THEN ${numEur}
                  WHEN product.currency = 'CNY' THEN ${numCny}
                  WHEN product.currency = 'JPY' THEN ${numJpy}
                  ELSE 1
                END
            END)`),
        'price',
      ],
      [
        literal(`
            SUM(CASE 
              WHEN product.currency = 'IDR' THEN 
                total_price 
              ELSE 
                total_price * CASE 
                  WHEN product.currency = 'USD' THEN ${numUsd}
                  WHEN product.currency = 'EUR' THEN ${numEur}
                  WHEN product.currency = 'CNY' THEN ${numCny}
                  WHEN product.currency = 'JPY' THEN ${numJpy}
                  ELSE 1
                END
            END)`),
        'total_price',
      ],
      [col('list_po.no_po'), 'no_po'],
      [fn('DATE', col('list_po_items.updated_at')), 'approved_at'], // Pastikan fungsi sesuai DB
      [col('product.name'), 'name'],
      [col('product.product_variant_name'), 'product_variant_name'],
      [col('list_po.supplier.name'), 'supplier'],
    ],
    where: {
      approved: 1,
      updated_at: {
        [Op.between]: [start_date, end_date],
      },
    },
    include: [
      {
        model: list_pos,
        attributes: [],
        where: {
          approved: 1,
          supplier_id:
            typeof fixSupplierId === 'object'
              ? { [Op.notIn]: fixSupplierId }
              : { [Op.eq]: fixSupplierId },
        },
        include: [
          {
            model: suppliers,
            attributes: [],
          },
        ],
      },
      {
        model: products,
        attributes: [],
      },
    ],
    order: [[{ model: list_pos, as: 'list_po' }, 'no_po', 'DESC']],
    group: [
      'list_po.no_po',
      'product.name',
      'product.product_variant_name',
      'list_po.supplier.name',
      'list_po_items.id',
    ],
  })

  return SuccessHandler(res, '', result)
})
