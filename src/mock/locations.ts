import type { DayLocationItem, EmployeeDailyLocation, TripItem } from '@/types'

// ============================================
// 当日行程/酒店 Mock 数据
// ============================================

function getRelativeDate(daysOffset: number): string {
  const date = new Date()
  date.setDate(date.getDate() + daysOffset)
  return date.toISOString().split('T')[0]
}

// 每个员工每天的行程/酒店明细
export const employeeDailyLocations: EmployeeDailyLocation[] = [
  // E001 - 张三 - 5/25~5/28 深圳出差，有行程+酒店组合
  {
    empId: 'E001',
    date: getRelativeDate(0),
    items: [
      {
        placeType: 'travel',
        placeName: '深圳',
        date: getRelativeDate(0),
        category: 1,
        startPlace: '上海',
        endPlace: '深圳',
        transportNo: 'CZ4567',
        status: 'ongoing',
      },
      {
        placeType: 'hotel',
        placeName: '深圳',
        date: getRelativeDate(0),
        hotelName: '深圳华宾馆',
        roomType: '豪华房',
        status: 'ongoing',
      },
    ],
  },
  {
    empId: 'E001',
    date: getRelativeDate(-1),
    items: [
      {
        placeType: 'travel',
        placeName: '深圳',
        date: getRelativeDate(-1),
        category: 0,
        startPlace: '上海',
        endPlace: '深圳',
        transportNo: 'G77',
        status: 'finished',
      },
      {
        placeType: 'hotel',
        placeName: '深圳',
        date: getRelativeDate(-1),
        hotelName: '深圳华宾馆',
        roomType: '豪华房',
        status: 'finished',
      },
    ],
  },
  {
    empId: 'E001',
    date: getRelativeDate(1),
    items: [
      {
        placeType: 'travel',
        placeName: '深圳',
        date: getRelativeDate(1),
        category: 2,
        startPlace: '深圳',
        endPlace: '惠州',
        transportNo: '租车自驾',
        status: 'upcoming',
      },
    ],
  },

  // E002 - 李四 - 东京出差，多日行程+多酒店
  {
    empId: 'E002',
    date: getRelativeDate(0),
    items: [
      {
        placeType: 'travel',
        placeName: '东京',
        date: getRelativeDate(0),
        category: 1,
        startPlace: '北京',
        endPlace: '东京',
        transportNo: 'CA1234',
        status: 'ongoing',
      },
      {
        placeType: 'hotel',
        placeName: '东京',
        date: getRelativeDate(0),
        hotelName: '东京王子酒店',
        roomType: '标准间',
        status: 'ongoing',
      },
    ],
  },
  {
    empId: 'E002',
    date: getRelativeDate(-2),
    items: [
      {
        placeType: 'travel',
        placeName: '北京',
        date: getRelativeDate(-2),
        category: 1,
        startPlace: '上海',
        endPlace: '北京',
        transportNo: 'MU5120',
        status: 'finished',
      },
      {
        placeType: 'hotel',
        placeName: '北京',
        date: getRelativeDate(-2),
        hotelName: '北京国际饭店',
        roomType: '商务间',
        status: 'finished',
      },
      {
        placeType: 'travel',
        placeName: '北京',
        date: getRelativeDate(-2),
        category: 1,
        startPlace: '北京',
        endPlace: '东京',
        transportNo: 'CA1234',
        status: 'finished',
      },
    ],
  },

  // E003 - 王五 - 广州出差，只有行程
  {
    empId: 'E003',
    date: getRelativeDate(0),
    items: [
      {
        placeType: 'travel',
        placeName: '广州',
        date: getRelativeDate(0),
        category: 0,
        startPlace: '上海',
        endPlace: '广州',
        transportNo: 'G85',
        status: 'ongoing',
      },
    ],
  },

  // E004 - 赵六 - 即将出差，只有酒店预订
  {
    empId: 'E004',
    date: getRelativeDate(1),
    items: [
      {
        placeType: 'travel',
        placeName: '深圳',
        date: getRelativeDate(1),
        category: 1,
        startPlace: '上海',
        endPlace: '深圳',
        transportNo: 'CZ3888',
        status: 'upcoming',
      },
      {
        placeType: 'hotel',
        placeName: '深圳',
        date: getRelativeDate(1),
        hotelName: '深圳湾万豪酒店',
        roomType: '海景房',
        status: 'upcoming',
      },
    ],
  },

  // E005 - 孙七 - 新加坡出差，有高铁+飞机+酒店
  {
    empId: 'E005',
    date: getRelativeDate(0),
    items: [
      {
        placeType: 'travel',
        placeName: '深圳',
        date: getRelativeDate(0),
        category: 0,
        startPlace: '上海',
        endPlace: '深圳',
        transportNo: 'G99',
        status: 'ongoing',
      },
      {
        placeType: 'travel',
        placeName: '新加坡',
        date: getRelativeDate(0),
        category: 1,
        startPlace: '深圳',
        endPlace: '新加坡',
        transportNo: 'SQ853',
        status: 'ongoing',
      },
      {
        placeType: 'hotel',
        placeName: '新加坡',
        date: getRelativeDate(0),
        hotelName: '新加坡滨海湾金沙',
        roomType: '豪华套房',
        status: 'ongoing',
      },
    ],
  },
]

// 根据员工ID和日期查询当日行程
export function getEmployeeDailyLocation(empId: string, date: string): DayLocationItem[] {
  const found = employeeDailyLocations.find(
    (loc) => loc.empId === empId && loc.date === date
  )
  return found ? found.items : []
}

// 将 dayItems 注入到 trips 中（用于抽屉展示）
export function enrichTripsWithDayItems(trips: TripItem[], empId: string): TripItem[] {
  return trips.map((trip) => {
    const allItems: DayLocationItem[] = []
    const start = new Date(trip.startTime)
    const end = new Date(trip.endTime)

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0]
      const items = getEmployeeDailyLocation(empId, dateStr)
      allItems.push(...items)
    }

    return {
      ...trip,
      dayItems: allItems,
    }
  })
}