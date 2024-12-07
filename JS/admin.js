/* 一一一一一一一一一一 變數宣告區 ↓ 一一一一一一一一一一 */
let orderData = [];
const orderList = document.querySelector(".order-list");
const orderStatus = document.querySelector(".orderStatus");
const discardAllBtn = document.querySelector(".discardAllBtn");
/* 一一一一一一一一一一 變數宣告區 ↑ 一一一一一一一一一一 */

/* 一一一一一一一一一一 函式宣告區 ↓ 一一一一一一一一一一 */
// 初始化
const init = () => {
  getOrderList();
};

// 取得後台訂單資料
const getOrderList = () => {
  axios
    .get(`${base_url}/admin/${api_path}/orders`, {
      headers: {
        authorization: token,
      },
    })
    .then(function (response) {
      orderData = response.data.orders;
      renderOrderList();
    })
    .catch(function (error) {
      console.log(error.message);
    });
};

// 渲染訂單表格
const renderOrderList = () => {
  let str = "";

  orderData.forEach((item) => {
    // 日期字串
    const timeStamp = new Date(item.createdAt * 1000); // Unix 時間戳（以秒為單位）轉換為毫秒
    const orderDate = `${timeStamp.getFullYear()}/${
      timeStamp.getMonth() + 1 //取得月份（範圍是 0-11，需要加 1 才是正常的月份）
    }/${timeStamp.getDate()}`;

    // 組產品字串
    let productStr = item.products
      .map((productItem) => `${productItem.title} × ${productItem.quantity}`)
      .join("<br>");

    // 判斷訂單狀態
    let orderStatusStr = "";
    item.paid == true
      ? (orderStatusStr = "已處理")
      : (orderStatusStr = "未處理");

    // 組資料表格字串
    str += `<tr>
       <td>${item.id}</td>
       <td>
         <p>${item.user.name}</p>
         <p>${item.user.tel}</p>
       </td>
         <td>${item.user.address}</td>
         <td>${item.user.email}</td>
       <td>
         <p>${productStr}</p>
       </td>
       <td>${orderDate}</td>
       <td>
         <a href="#"  
            class="orderStatus"
            data-status="${item.paid}"
            data-id="${item.id}">
          ${orderStatusStr}
         </a>
       </td>
       <td>
         <input type="button" class="delSingleOrder-Btn" data-id="${item.id}" value="刪除" />
       </td>
    </tr>`;
  });

  orderList.innerHTML = str;
};

// 修改後台訂單狀態
const changeOrderStatus = (status, id) => {
  let newStatus;
  status == "true" ? (newStatus = false) : (newStatus = true);

  axios
    .put(
      `${base_url}/admin/${api_path}/orders`,
      {
        data: {
          id: id,
          paid: newStatus,
        },
      },
      {
        headers: {
          authorization: token,
        },
      }
    )
    .then(function (response) {
      Swal.fire("修改訂單狀態成功");
      getOrderList();
    });
};

// 刪除後台單筆訂單資料
const delSingleOrder = (id) => {
  axios
    .delete(`${base_url}/admin/${api_path}/orders/${id}`, {
      headers: {
        authorization: token,
      },
    })

    .then(function (response) {
      Swal.fire("刪除該筆訂單成功");
      getOrderList();
    });
};

// 刪除後台全部訂單
const delAllOrder = () => {
  axios
    .delete(`${base_url}/admin/${api_path}/orders`, {
      headers: {
        authorization: token,
      },
    })

    .then(function (response) {
      Swal.fire("刪除全部訂單成功");
      getOrderList();
    });
};
/* 一一一一一一一一一一 函式宣告區 ↑ 一一一一一一一一一一 */

/* 一一一一一一一一一一 執行代碼區 ↓ 一一一一一一一一一一 */
// 畫面初始化渲染
init();

// 監聽清除全部訂單按鈕
discardAllBtn.addEventListener("click", function (e) {
  e.preventDefault();
  delAllOrder();
});

// 監聽資料表格
orderList.addEventListener("click", function (e) {
  e.preventDefault();
  const targetClass = e.target.getAttribute("class");
  const id = e.target.getAttribute("data-id");

  if (targetClass === "orderStatus") {
    const status = e.target.getAttribute("data-status");
    changeOrderStatus(status, id);
  }

  if (targetClass === "delSingleOrder-Btn") {
    delSingleOrder(id);
  }
});
/* 一一一一一一一一一一 執行代碼區 ↑ 一一一一一一一一一一 */
