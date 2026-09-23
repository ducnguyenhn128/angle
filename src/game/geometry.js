/** Điểm cách p một khoảng r theo hướng deg (độ, ngược chiều kim đồng hồ, trục y hướng lên). */
export const polar = ([x, y], deg, r) => [x + r * Math.cos((deg * Math.PI) / 180), y + r * Math.sin((deg * Math.PI) / 180)];
