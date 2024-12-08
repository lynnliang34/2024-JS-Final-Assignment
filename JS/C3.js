// C3 圖表
const renderC3 = () => {
  // 物件資料蒐集
  let obj = {};
  orderData.forEach((item) => {
    item.products.forEach((productItem) => {
      const productName = productItem.title;
      obj[productName] =
        (obj[productName] || 0) + productItem.price * productItem.quantity;
    });
  });

  // 轉換陣列並排序
  const rankSortAry = Object.entries(obj).sort((a, b) => b[1] - a[1]);

  // 顯示前三品項，第四筆以上統整成其他
  const otherTotal = rankSortAry
    .slice(3)
    .reduce((sum, item) => sum + item[1], 0);
  const c3Ary = rankSortAry.slice(0, 3);
  c3Ary.push(["其他", otherTotal]);
  console.log(c3Ary);

  // 圓餅圖
  let chart = c3.generate({
    bindto: "#chart", // HTML 元素綁定
    data: {
      type: "pie",
      columns: c3Ary,
    },
    color: {
      pattern: ["#301E5F", "#5434A7", "#9D7FEA", "#DACBFF"],
    },
  });
};
