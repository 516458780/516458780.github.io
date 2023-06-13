
export function getTreeMaxFloor(tree, childKey = 'children') {
    if (tree instanceof Array) {
        let maxFloor = 0

        tree.forEach((item) => {
            const floor = getTreeMaxFloor(item)
            if (maxFloor < floor) {
                maxFloor = floor
            }
        })

        return maxFloor
    }

    let maxFloor = 1
    if (!tree[childKey]) {
        return maxFloor
    }

    let childMaxFloor = 0

    tree[childKey].forEach((child) => {
        const floor = getTreeMaxFloor(child)
        if (childMaxFloor < floor) {
            childMaxFloor = floor
        }
    })

    return maxFloor + childMaxFloor
}

export function getTreeLeafTotal(tree, childKey = 'children') {
    let leafTotal = 0
    if (!tree[childKey]) {
        leafTotal++
        return leafTotal
    }

    tree[childKey].forEach((child) => {
        leafTotal += getTreeLeafTotal(child)
    })

    return leafTotal
}

export async function exportExcel(options = {}) {
    const config = Object.assign({
        filename: 'download',
        titleArr: [
            // {
            //   name: '一级标题',
            //   children: [
            //     {
            //       name: '二级标题',
            //       // 需要读取data中的变量名
            //       prop: 'nickname'
            //     },
            //     {
            //       name: '二级标题',
            //       prop: 'age'
            //     }
            //   ]
            // }
        ],
        data: []
    }, options)


    const drawHeader = (option = {}) => {
        let { worksheet, startRow, startColumn, maxFloor, treeArr } = option

        treeArr.forEach((item, index) => {
            const floor = getTreeMaxFloor(item)
            const leafTotal = getTreeLeafTotal(item)

            let endRow = startRow
            let endColumn = startColumn + leafTotal - 1

            if (floor < maxFloor) {
                endRow = startRow + (maxFloor - floor)
            }

            worksheet.mergeCells(
                startRow,
                startColumn,
                endRow,
                endColumn
            )
            worksheet.getCell(startRow, startColumn).value = item.name

            if (item.children) {
                drawHeader({
                    worksheet,
                    startRow: endRow + 1,
                    startColumn,
                    maxFloor: getTreeMaxFloor(item.children),
                    treeArr: item.children
                })
            } else {
                if (item.prop) {
                    prop[startColumn] = item
                }
            }

            startColumn += leafTotal
        })
    }

    let prop = {}

    // const ExcelJS = await import('./exceljs.js')
    // console.log(ExcelJS.Workbook)
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('My Sheet')

    let maxFloor = getTreeMaxFloor(config.titleArr)

    drawHeader({
        worksheet,
        startRow: 1,
        startColumn: 1,
        maxFloor,
        treeArr: config.titleArr
    })

    config.data.forEach((item, index) => {
        const rowNum = maxFloor + index + 1
        for (let n in prop) {
            worksheet.getCell(rowNum, n).value = item[prop[n].prop]
        }
    })


    // 下载文件
    const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], { type: EXCEL_TYPE })
    downloadBlob(blob, `${config.filename}.xlsx`)
}

export const downloadBlob = (blob, fileName) => {
    try {
        const href = window.URL.createObjectURL(blob); //创建下载的链接
        if (window.navigator.msSaveBlob) {
            window.navigator.msSaveBlob(blob, fileName);
        } else {
            // 谷歌浏览器 创建a标签 添加download属性下载
            const downloadElement = document.createElement("a");
            downloadElement.href = href;
            downloadElement.target = "_blank";
            downloadElement.download = fileName;
            document.body.appendChild(downloadElement);
            downloadElement.click(); // 点击下载
            document.body.removeChild(downloadElement); // 下载完成移除元素
            window.URL.revokeObjectURL(href); // 释放掉blob对象
        }
    } catch (e) {
        console.log("下载失败");
    }
}

export const titleArr = [
    {
        "name": "数据名",
        "prop": "name"
    },
    {
        "name": "分类1",
        "children": [
            {
                "name": "数据1",
                "prop": "分类1-receptionNum"
            },
            {
                "name": "数据2",
                "prop": "分类1-receptionTime"
            },
            {
                "name": "数据3",
                "prop": "分类1-sendMessageNum"
            }
        ]
    },
    {
        "name": "分类2",
        "children": [
            {
                "name": "数据1",
                "prop": "分类2-receptionNum"
            },
            {
                "name": "数据2",
                "prop": "分类2-receptionTime"
            }
        ]
    },
    {
        "name": "分类3",
        "children": [
            {
                "name": "数据1",
                "prop": "分类3-receptionNum"
            },
            {
                "name": "数据2",
                "prop": "分类3-receptionTime"
            }
        ]
    },
    {
        "name": "分类4",
        "children": [
            {
                "name": "数据1",
                "prop": "分类4-receptionNum"
            },
            {
                "name": "数据2",
                "prop": "分类4-receptionTime"
            }
        ]
    }
]
export const dataArr = [
    {
        "name": "数据1",
        "分类1-receptionNum": 6,
        "分类1-receptionTime": 1,
        "分类1-sendMessageNum": 68,
        "分类2-receptionNum": 0,
        "分类2-receptionTime": 0,
        "分类3-receptionNum": 0,
        "分类3-receptionTime": 0,
        "分类4-receptionNum": 6,
        "分类4-receptionTime": 1
    },
    {
        "name": "数据2",
        "分类1-receptionNum": 1,
        "分类1-receptionTime": 0,
        "分类1-sendMessageNum": 10,
        "分类2-receptionNum": 0,
        "分类2-receptionTime": 0,
        "分类3-receptionNum": 0,
        "分类3-receptionTime": 0,
        "分类4-receptionNum": 1,
        "分类4-receptionTime": 0
    },
    {
        "name": "数据3",
        "分类1-receptionNum": 5,
        "分类1-receptionTime": 0,
        "分类1-sendMessageNum": 8,
        "分类2-receptionNum": 0,
        "分类2-receptionTime": 0,
        "分类3-receptionNum": 0,
        "分类3-receptionTime": 0,
        "分类4-receptionNum": 5,
        "分类4-receptionTime": 0
    },
    {
        "name": "数据4",
        "分类1-receptionNum": 4,
        "分类1-receptionTime": 1,
        "分类1-sendMessageNum": 18,
        "分类2-receptionNum": 1,
        "分类2-receptionTime": 1,
        "分类3-receptionNum": 1,
        "分类3-receptionTime": 4,
        "分类4-receptionNum": 6,
        "分类4-receptionTime": 6
    },
    {
        "name": "数据5",
        "分类1-receptionNum": 0,
        "分类1-receptionTime": 0,
        "分类1-sendMessageNum": 6,
        "分类2-receptionNum": 0,
        "分类2-receptionTime": 0,
        "分类3-receptionNum": 0,
        "分类3-receptionTime": 0,
        "分类4-receptionNum": 0,
        "分类4-receptionTime": 0
    }
]

console.log(111)
