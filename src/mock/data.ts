import type { Department } from '@/types'

// ============================================
// Mock 部门数据
// ============================================
export const departments: Department[] = [
  { id: 'D001', name: '技术部' },
  { id: 'D002', name: '市场部' },
  { id: 'D003', name: '销售部' },
  { id: 'D004', name: '产品部' },
  { id: 'D005', name: '财务部' },
  { id: 'D006', name: '人力资源部' },
]

// ============================================
// Mock 员工数据
// ============================================
export interface MockEmployee {
  empId: string
  empName: string
  deptName: string
  position: string
  avatar?: string
}

export const employees: MockEmployee[] = [
  { empId: 'E001', empName: '张明远', deptName: '技术部', position: '前端工程师' },
  { empId: 'E002', empName: '李思琪', deptName: '市场部', position: '市场经理' },
  { empId: 'E003', empName: '王建国', deptName: '销售部', position: '销售总监' },
  { empId: 'E004', empName: '陈雨萱', deptName: '产品部', position: '产品经理' },
  { empId: 'E005', empName: '刘浩然', deptName: '技术部', position: '后端工程师' },
  { empId: 'E006', empName: '赵晓敏', deptName: '财务部', position: '财务主管' },
  { empId: 'E007', empName: '孙伟', deptName: '技术部', position: '架构师' },
  { empId: 'E008', empName: '周雅婷', deptName: '人力资源部', position: 'HR总监' },
  { empId: 'E009', empName: '吴志强', deptName: '销售部', position: '销售经理' },
  { empId: 'E010', empName: '郑雅琴', deptName: '市场部', position: '市场专员' },
  { empId: 'E011', empName: '周天龙', deptName: '技术部', position: '测试工程师' },
  { empId: 'E012', empName: '吴小燕', deptName: '运营部', position: '运营主管' },
  { empId: 'E013', empName: '郑浩然', deptName: '市场部', position: '市场策划' },
  { empId: 'E014', empName: '冯雪梅', deptName: '产品部', position: 'UI设计师' },
  { empId: 'E015', empName: '陈俊杰', deptName: '技术部', position: '运维工程师' },
  { empId: 'E016', empName: '林晓东', deptName: '技术部', position: '数据工程师' },
  { empId: 'E017', empName: '何丽华', deptName: '财务部', position: '会计' },
  { empId: 'E018', empName: '高建明', deptName: '销售部', position: '销售代表' },
  { empId: 'E019', empName: '马晓燕', deptName: '市场部', position: '品牌经理' },
  { empId: 'E020', empName: '韩志远', deptName: '技术部', position: 'Java开发' },
  { empId: 'E021', empName: '罗敏', deptName: '人力资源部', position: '招聘专员' },
  { empId: 'E022', empName: '梁文强', deptName: '产品部', position: '产品运营' },
  { empId: 'E023', empName: '丁玉婷', deptName: '市场部', position: '内容运营' },
  { empId: 'E024', empName: '姜海峰', deptName: '技术部', position: 'Android开发' },
  { empId: 'E025', empName: '萧雅静', deptName: '财务部', position: '出纳' },
  { empId: 'E026', empName: '余洪伟', deptName: '销售部', position: '大客户经理' },
  { empId: 'E027', empName: '田秀英', deptName: '市场部', position: '活动策划' },
  { empId: 'E028', empName: '谢振华', deptName: '技术部', position: 'iOS开发' },
  { empId: 'E029', empName: '杜晓丽', deptName: '产品部', position: '交互设计师' },
  { empId: 'E030', empName: '秦松涛', deptName: '技术部', position: '前端Leader' },
  { empId: 'E031', empName: '白洁', deptName: '人力资源部', position: '培训专员' },
  { empId: 'E032', empName: '崔志刚', deptName: '销售部', position: '区域总监' },
  { empId: 'E033', empName: '董文慧', deptName: '市场部', position: 'SEM专员' },
  { empId: 'E034', empName: '范晓峰', deptName: '技术部', position: '算法工程师' },
  { empId: 'E035', empName: '邓秀英', deptName: '财务部', position: '财务经理' },
  { empId: 'E036', empName: '傅伟', deptName: '产品部', position: '产品助理' },
  { empId: 'E037', empName: '程丽', deptName: '市场部', position: '海外市场' },
  { empId: 'E038', empName: '钟俊杰', deptName: '技术部', position: 'DevOps工程师' },
  { empId: 'E039', empName: '曹敏', deptName: '人力资源部', position: '薪酬绩效' },
  { empId: 'E040', empName: '彭磊', deptName: '销售部', position: '渠道经理' },
  { empId: 'E041', empName: '吕思琪', deptName: '市场部', position: '用户研究' },
  { empId: 'E042', empName: '苏志刚', deptName: '技术部', position: '安全工程师' },
  { empId: 'E043', empName: '曾晓燕', deptName: '产品部', position: '需求分析' },
  { empId: 'E044', empName: '薛明远', deptName: '技术部', position: '云架构师' },
  { empId: 'E045', empName: '贺丽华', deptName: '市场部', position: '数字营销' },
  { empId: 'E046', empName: '雷伟', deptName: '销售部', position: '售前顾问' },
  { empId: 'E047', empName: '钱志鹏', deptName: '技术部', position: '测试Lead' },
  { empId: 'E048', empName: '倪秀英', deptName: '财务部', position: '成本会计' },
  { empId: 'E049', empName: '卫晨', deptName: '产品部', position: '数据产品经理' },
  { empId: 'E050', empName: '蒋浩然', deptName: '市场部', position: '创意设计' },
]

// ============================================
// Mock 行程数据（基于当前日期生成）
// ============================================
export interface MockTrip {
  id: string
  empId: string
  city: string
  tripType: 'domestic' | 'overseas'
  startTime: string
  endTime: string
  status: 'ongoing' | 'upcoming' | 'finished' | 'conflict'
  assistants?: { name: string; email: string; phone?: string }[]
}

// 生成相对日期
function getRelativeDate(daysOffset: number): string {
  const date = new Date()
  date.setDate(date.getDate() + daysOffset)
  return date.toISOString().split('T')[0]
}

export const trips: MockTrip[] = [
  // E001 - 张明远
  { id: 'T001', empId: 'E001', city: '北京', tripType: 'domestic', startTime: getRelativeDate(-2), endTime: getRelativeDate(1), status: 'ongoing', assistants: [{ name: '李明', email: 'liming@example.com', phone: '138-1234-5678' }, { name: '王芳', email: 'wangfang@example.com', phone: '139-8765-4321' }] },
  { id: 'T046', empId: 'E001', city: '郑州', tripType: 'domestic', startTime: getRelativeDate(2), endTime: getRelativeDate(5), status: 'upcoming' },
  { id: 'T011', empId: 'E001', city: '上海', tripType: 'domestic', startTime: getRelativeDate(10), endTime: getRelativeDate(13), status: 'upcoming', assistants: [{ name: '赵敏', email: 'zhaomin@example.com', phone: '135-5555-6666' }] },
  { id: 'T031', empId: 'E001', city: '武汉', tripType: 'domestic', startTime: getRelativeDate(15), endTime: getRelativeDate(18), status: 'upcoming' },

  // E002 - 李思琪
  { id: 'T002', empId: 'E002', city: '东京', tripType: 'overseas', startTime: getRelativeDate(-5), endTime: getRelativeDate(4), status: 'ongoing', assistants: [{ name: '田中太郎', email: 'tanaka@example.com', phone: '+81-90-1234-5678' }] },
  { id: 'T047', empId: 'E002', city: '胡志明市', tripType: 'overseas', startTime: getRelativeDate(6), endTime: getRelativeDate(10), status: 'upcoming' },
  { id: 'T032', empId: 'E002', city: '台北', tripType: 'overseas', startTime: getRelativeDate(-12), endTime: getRelativeDate(-8), status: 'finished' },

  // E003 - 王建国
  { id: 'T012', empId: 'E003', city: '武汉', tripType: 'domestic', startTime: getRelativeDate(2), endTime: getRelativeDate(4), status: 'upcoming' },
  { id: 'T003', empId: 'E003', city: '上海', tripType: 'domestic', startTime: getRelativeDate(-10), endTime: getRelativeDate(-6), status: 'finished', assistants: [{ name: '张华', email: 'zhanghua@example.com', phone: '137-1111-2222' }] },
  { id: 'T033', empId: 'E003', city: '大连', tripType: 'domestic', startTime: getRelativeDate(5), endTime: getRelativeDate(7), status: 'upcoming' },
  { id: 'T048', empId: 'E003', city: '哈尔滨', tripType: 'domestic', startTime: getRelativeDate(-15), endTime: getRelativeDate(-11), status: 'finished' },

  // E004 - 陈雨萱
  { id: 'T019', empId: 'E004', city: '天津', tripType: 'domestic', startTime: getRelativeDate(-5), endTime: getRelativeDate(-2), status: 'finished' },
  { id: 'T004', empId: 'E004', city: '深圳', tripType: 'domestic', startTime: getRelativeDate(2), endTime: getRelativeDate(5), status: 'upcoming' },
  { id: 'T034', empId: 'E004', city: '米兰', tripType: 'overseas', startTime: getRelativeDate(7), endTime: getRelativeDate(12), status: 'upcoming' },
  { id: 'T049', empId: 'E004', city: '芝加哥', tripType: 'overseas', startTime: getRelativeDate(-14), endTime: getRelativeDate(-9), status: 'finished', assistants: [{ name: 'Tom Wilson', email: 'tom.w@example.com', phone: '+1-312-555-0202' }] },

  // E005 - 刘浩然
  { id: 'T035', empId: 'E005', city: '沈阳', tripType: 'domestic', startTime: getRelativeDate(-8), endTime: getRelativeDate(-5), status: 'finished' },
  { id: 'T005', empId: 'E005', city: '新加坡', tripType: 'overseas', startTime: getRelativeDate(-3), endTime: getRelativeDate(2), status: 'ongoing', assistants: [{ name: '陈小明', email: 'chenxiaoming@example.com', phone: '+65-8123-4567' }] },
  { id: 'T050', empId: 'E005', city: '贵阳', tripType: 'domestic', startTime: getRelativeDate(8), endTime: getRelativeDate(11), status: 'upcoming' },
  { id: 'T020', empId: 'E005', city: '墨尔本', tripType: 'overseas', startTime: getRelativeDate(13), endTime: getRelativeDate(19), status: 'upcoming' },

  // E006 - 赵晓敏
  { id: 'T006', empId: 'E006', city: '广州', tripType: 'domestic', startTime: getRelativeDate(-11), endTime: getRelativeDate(-8), status: 'finished' },
  { id: 'T021', empId: 'E006', city: '苏州', tripType: 'domestic', startTime: getRelativeDate(6), endTime: getRelativeDate(9), status: 'upcoming' },
  { id: 'T051', empId: 'E006', city: '雅加达', tripType: 'overseas', startTime: getRelativeDate(-5), endTime: getRelativeDate(-1), status: 'finished' },
  { id: 'T036', empId: 'E006', city: '三亚', tripType: 'domestic', startTime: getRelativeDate(12), endTime: getRelativeDate(15), status: 'upcoming' },

  // E007 - 孙伟
  { id: 'T022', empId: 'E007', city: '伦敦', tripType: 'overseas', startTime: getRelativeDate(-10), endTime: getRelativeDate(-5), status: 'finished' },
  { id: 'T007', empId: 'E007', city: '旧金山', tripType: 'overseas', startTime: getRelativeDate(-2), endTime: getRelativeDate(4), status: 'ongoing', assistants: [{ name: 'Mike Johnson', email: 'mike.j@example.com', phone: '+1-415-555-0100' }, { name: 'Sarah Lee', email: 'sarah.lee@example.com', phone: '+1-650-555-0200' }] },
  { id: 'T052', empId: 'E007', city: '长沙', tripType: 'domestic', startTime: getRelativeDate(8), endTime: getRelativeDate(11), status: 'upcoming' },
  { id: 'T037', empId: 'E007', city: '巴黎', tripType: 'overseas', startTime: getRelativeDate(-17), endTime: getRelativeDate(-12), status: 'finished', assistants: [{ name: 'Jean Dupont', email: 'jean.dupont@example.com', phone: '+33-6-1234-5678' }] },

  // E008 - 周雅婷
  { id: 'T008', empId: 'E008', city: '成都', tripType: 'domestic', startTime: getRelativeDate(-8), endTime: getRelativeDate(-4), status: 'finished', assistants: [{ name: '刘洋', email: 'liuyang@example.com', phone: '136-9999-8888' }] },
  { id: 'T023', empId: 'E008', city: '厦门', tripType: 'domestic', startTime: getRelativeDate(2), endTime: getRelativeDate(5), status: 'upcoming' },
  { id: 'T053', empId: 'E008', city: '罗马', tripType: 'overseas', startTime: getRelativeDate(-2), endTime: getRelativeDate(2), status: 'ongoing' },
  { id: 'T038', empId: 'E008', city: '昆明', tripType: 'domestic', startTime: getRelativeDate(-18), endTime: getRelativeDate(-14), status: 'finished' },

  // E009 - 吴志强
  { id: 'T024', empId: 'E009', city: '首尔', tripType: 'overseas', startTime: getRelativeDate(-4), endTime: getRelativeDate(0), status: 'ongoing', assistants: [{ name: '金钟民', email: 'kim@example.com', phone: '+82-10-1111-2222' }] },
  { id: 'T009', empId: 'E009', city: '香港', tripType: 'overseas', startTime: getRelativeDate(5), endTime: getRelativeDate(10), status: 'upcoming' },
  { id: 'T039', empId: 'E009', city: '吉隆坡', tripType: 'overseas', startTime: getRelativeDate(-14), endTime: getRelativeDate(-9), status: 'finished' },
  { id: 'T054', empId: 'E009', city: '宁波', tripType: 'domestic', startTime: getRelativeDate(-20), endTime: getRelativeDate(-16), status: 'finished' },

  // E010 - 郑雅琴
  { id: 'T025', empId: 'E010', city: '济南', tripType: 'domestic', startTime: getRelativeDate(-6), endTime: getRelativeDate(-3), status: 'finished' },
  { id: 'T040', empId: 'E010', city: '石家庄', tripType: 'domestic', startTime: getRelativeDate(-2), endTime: getRelativeDate(1), status: 'ongoing' },
  { id: 'T055', empId: 'E010', city: '马德里', tripType: 'overseas', startTime: getRelativeDate(5), endTime: getRelativeDate(10), status: 'upcoming' },
  { id: 'T010', empId: 'E010', city: '杭州', tripType: 'domestic', startTime: getRelativeDate(-13), endTime: getRelativeDate(-10), status: 'finished' },

  // E011 - 周天龙
  { id: 'T013', empId: 'E011', city: '西安', tripType: 'domestic', startTime: getRelativeDate(-7), endTime: getRelativeDate(-3), status: 'finished' },
  { id: 'T026', empId: 'E011', city: '曼谷', tripType: 'overseas', startTime: getRelativeDate(4), endTime: getRelativeDate(8), status: 'upcoming' },
  { id: 'T041', empId: 'E011', city: '洛杉矶', tripType: 'overseas', startTime: getRelativeDate(-16), endTime: getRelativeDate(-10), status: 'finished', assistants: [{ name: 'John Smith', email: 'john.s@example.com', phone: '+1-310-555-0101' }] },
  { id: 'T056', empId: 'E011', city: '乌鲁木齐', tripType: 'domestic', startTime: getRelativeDate(-22), endTime: getRelativeDate(-18), status: 'finished' },

  // E012 - 吴小燕
  { id: 'T042', empId: 'E012', city: '无锡', tripType: 'domestic', startTime: getRelativeDate(-10), endTime: getRelativeDate(-6), status: 'finished' },
  { id: 'T027', empId: 'E012', city: '青岛', tripType: 'domestic', startTime: getRelativeDate(-2), endTime: getRelativeDate(2), status: 'ongoing' },
  { id: 'T014', empId: 'E012', city: '南京', tripType: 'domestic', startTime: getRelativeDate(6), endTime: getRelativeDate(9), status: 'upcoming' },
  { id: 'T057', empId: 'E012', city: '新加坡', tripType: 'overseas', startTime: getRelativeDate(-19), endTime: getRelativeDate(-14), status: 'finished' },

  // E013 - 郑浩然
  { id: 'T028', empId: 'E013', city: '温哥华', tripType: 'overseas', startTime: getRelativeDate(-9), endTime: getRelativeDate(-4), status: 'finished' },
  { id: 'T043', empId: 'E013', city: '阿姆斯特丹', tripType: 'overseas', startTime: getRelativeDate(3), endTime: getRelativeDate(8), status: 'upcoming' },
  { id: 'T015', empId: 'E013', city: '迪拜', tripType: 'overseas', startTime: getRelativeDate(-15), endTime: getRelativeDate(-10), status: 'finished' },
  { id: 'T058', empId: 'E013', city: '拉萨', tripType: 'domestic', startTime: getRelativeDate(-23), endTime: getRelativeDate(-19), status: 'finished' },

  // E014 - 冯雪梅
  { id: 'T016', empId: 'E014', city: '重庆', tripType: 'domestic', startTime: getRelativeDate(-5), endTime: getRelativeDate(-1), status: 'finished' },
  { id: 'T029', empId: 'E014', city: '长沙', tripType: 'domestic', startTime: getRelativeDate(2), endTime: getRelativeDate(4), status: 'upcoming' },
  { id: 'T059', empId: 'E014', city: '波士顿', tripType: 'overseas', startTime: getRelativeDate(7), endTime: getRelativeDate(12), status: 'upcoming' },
  { id: 'T044', empId: 'E014', city: '南昌', tripType: 'domestic', startTime: getRelativeDate(-18), endTime: getRelativeDate(-14), status: 'finished' },

  // E015 - 陈俊杰
  { id: 'T045', empId: 'E015', city: '开罗', tripType: 'overseas', startTime: getRelativeDate(-12), endTime: getRelativeDate(-7), status: 'finished' },
  { id: 'T030', empId: 'E015', city: '法兰克福', tripType: 'overseas', startTime: getRelativeDate(4), endTime: getRelativeDate(9), status: 'upcoming' },
  { id: 'T060', empId: 'E015', city: '太原', tripType: 'domestic', startTime: getRelativeDate(-2), endTime: getRelativeDate(1), status: 'ongoing' },
  { id: 'T017', empId: 'E015', city: '悉尼', tripType: 'overseas', startTime: getRelativeDate(-20), endTime: getRelativeDate(-14), status: 'finished' },
]