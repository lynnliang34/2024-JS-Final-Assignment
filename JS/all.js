/* 一一一一一一一一一一 變數宣告區 ↓ 一一一一一一一一一一 */
let productData = []; // 產品資料
let categorySearchResult = []; // 篩選類別後產品資料
let cartData = []; // 購物車資料
const productList = document.querySelector(".productWrap");
const productSelect = document.querySelector(".productSelect");
const cartList = document.querySelector(".shoppingCart-tableList");
const totalAmount = document.querySelector(".total-amount");
const discardAllBtn = document.querySelector(".discardAllBtn");
const orderInfoInput = document.querySelectorAll(".orderInfo-input");
const orderInfoMessage = document.querySelectorAll(".orderInfo-message");
const orderInfoForm = document.querySelector(".orderInfo-form");
const orderInfoBtn = document.querySelector(".orderInfo-btn");

// 驗證表單
const formConstraints = {
  姓名: {
    presence: { message: "必填" },
  },
  電話: {
    presence: { message: "必填" },
    format: {
      pattern: "^0[0-9]*",
      message: "請輸入 0 開頭的數字",
    },
    length: {
      minimum: 9,
      maximum: 10,
      message: "請輸入手機 9 碼，或是市話加區號 9~10 碼",
    },
  },
  Email: {
    presence: { message: "必填" },
    email: { message: "請檢察格式" },
  },
  寄送地址: {
    presence: { message: "必填" },
  },
};

/* 一一一一一一一一一一 變數宣告區 ↑ 一一一一一一一一一一 */

/* 一一一一一一一一一一 函式宣告區 ↓ 一一一一一一一一一一 */
// 初始化
const init = () => {
  getProductList();
  getCartList();
};

// 取得後台產品清單
const getProductList = () => {
  axios
    .get(`${base_url}/customer/${api_path}/products`)
    .then(function (response) {
      productData = response.data.products;
      renderproductList(productData);
    })
    .catch(function (error) {
      console.log(error);
    });
};

// 渲染產品清單
const renderproductList = (productData) => {
  let str = "";

  productData.forEach(({ images, id, title, origin_price, price }) => {
    str += `
    <li class="productCard">
      <h4 class="productType">新品</h4>
      <img src="${images}" alt=""/>
      <a href="#" class="addCardBtn" prouduct-id="${id}">加入購物車</a>
      <h3>${title}</h3>
      <del class="originPrice">NT$${addThousandths(origin_price)}</del>
      <p class="nowPrice">NT$${addThousandths(price)}</p>
    </li>`;
  });

  productList.innerHTML = str;
};

// 篩選類別產生新陣列 categorySearchResult
const filterProductList = () => {
  const searchCategory = productSelect.value;
  const allCategory = "全部";

  categorySearchResult = productData.filter(function (product) {
    return (
      searchCategory === product.category || searchCategory === allCategory
    );
  });
};

// 取得購物車清單
const getCartList = () => {
  axios
    .get(`${base_url}/customer/${api_path}/carts`)
    .then(function (response) {
      cartData = response.data.carts;
      renderCartList(cartData);
      totalAmount.textContent = `NT$${addThousandths(
        response.data.finalTotal
      )}`;
    })
    .catch(function (error) {
      console.log(error);
    });
};

// 渲染購物車清單
const renderCartList = (cartData) => {
  cartList.innerHTML = cartData
    .map(
      (item) => `
      <tr>
        <td>
          <div class="cardItem-title">
            <img src="${item.product.images}" alt="" />
            <p>${item.product.title}</p>
          </div>
        </td>
        <td>NT$${addThousandths(item.product.price)}</td>
        <td>
          <a href="#" class="quantityBtn">
            <span class="material-symbols-outlined" quantity="minus" 
            cart-id="${item.id}">
              remove
            </span>
          </a>
          ${item.quantity}
          <a href="#" class="quantityBtn">
            <span class="material-symbols-outlined" quantity="add" 
            cart-id="${item.id}">
              add
            </span>
          </a>
        </td>
        <td>NT$${addThousandths(item.product.price * item.quantity)}</td>
        <td class="discardBtn">
          <a href="#" class="material-icons" cart-id="${item.id}"> clear </a>
        </td>
      </tr>`
    )
    .join("");
};

// 更改購物車商品數量
const changeCartQuantity = (quantity, cartId) => {
  let changeNum = 1;

  for (const item of cartData) {
    // 點擊取到的 ID = 購物車資料的 ID
    if (cartId === item.id) {
      // 如果點擊到 + 加 1
      if (quantity === "add") {
        changeNum = ++item.quantity;
        // 如果點擊到 -
      } else if (quantity === "minus") {
        // 如果數量 > 1 ，則直接減 1，若否刪除該項商品
        item.quantity > 1
          ? (changeNum = --item.quantity)
          : deleteCartProduct(cartId);
      }
      break; // 找到目標後直接退出迴圈，避免多餘的遍歷
    }
  }

  axios
    .patch(`${base_url}/customer/${api_path}/carts`, {
      data: {
        id: cartId,
        quantity: changeNum,
      },
    })
    .then(function (response) {
      getCartList();
    });
};

// 刪除購物車單項商品
const deleteCartProduct = (cartId) => {
  axios
    .delete(`${base_url}/customer/${api_path}/carts/${cartId}`)
    .then(function (response) {
      Swal.fire("刪除單筆訂單成功 (๑´ㅂ`๑)");
      getCartList();
    });
};

// 刪除購物車全部商品
const deleteAllCartProduct = () => {
  axios
    .delete(`${base_url}/customer/${api_path}/carts`)
    .then(function (response) {
      Swal.fire("刪除全部訂單成功 (๑´ㅂ`๑)");
      getCartList();
    });
};

// 送出訂單
const postOrder = () => {
  const customerName = document.querySelector("#customerName").value;
  const customerPhone = document.querySelector("#customerPhone").value;
  const customerEmail = document.querySelector("#customerEmail").value;
  const customerAddress = document.querySelector("#customerAddress").value;
  const customerTradeWay = document.querySelector("#tradeWay").value;

  axios
    .post(`${base_url}/customer/${api_path}/orders`, {
      data: {
        user: {
          name: customerName,
          tel: customerPhone,
          email: customerEmail,
          address: customerAddress,
          payment: customerTradeWay,
        },
      },
    })
    .then(function (response) {
      Swal.fire("成功送出訂單 (ﾉ>ω<)ﾉ");
      orderInfoForm.reset();
      getCartList();
    });
};
/* 一一一一一一一一一一 函式宣告區 ↑ 一一一一一一一一一一 */

/* 一一一一一一一一一一 執行代碼區 ↓ 一一一一一一一一一一 */
// 畫面初始化渲染
init();

// 產品下拉選單篩選類別
productSelect.addEventListener("change", function () {
  filterProductList();
  renderproductList(categorySearchResult);
});

// 點擊加入購物車
productList.addEventListener("click", function (e) {
  e.preventDefault();
  const prouductId = e.target.getAttribute("prouduct-id");

  if (prouductId == null) {
    return;
  }

  let newNum = 1;
  cartData.forEach((item) => {
    if (prouductId === item.product.id) {
      newNum = item.quantity += 1;
    }
  });

  axios
    .post(`${base_url}/customer/${api_path}/carts`, {
      data: {
        productId: prouductId,
        quantity: newNum,
      },
    })
    .then(function (response) {
      Swal.fire("已加入購物車~ d(`･∀･)b");
      getCartList();
    });
});

// 購物車：變更數量、刪除單項商品
cartList.addEventListener("click", function (e) {
  e.preventDefault();
  const quantity = e.target.getAttribute("quantity");
  const cartId = e.target.getAttribute("cart-id");

  // 如果點擊到 - + × 以外不執行
  if (cartId == null && quantity == null) {
    return;
    // 如果點擊到 - + 加或減 1
  } else if (!(quantity == null)) {
    changeCartQuantity(quantity, cartId);
    // 如果點擊到 × 刪除該項商品
  } else {
    deleteCartProduct(cartId);
  }
});

// 刪除購物車全部商品
discardAllBtn.addEventListener("click", function (e) {
  e.preventDefault();
  deleteAllCartProduct();
});

// 焦點離開輸入框時驗證
orderInfoInput.forEach((input) => {
  input.addEventListener("blur", function (e) {
    const targetName = e.target.getAttribute("name");
    const formError = validate(orderInfoForm, formConstraints) || [];
    const errorText = formError[targetName] || [];

    orderInfoMessage.forEach((message) => {
      const messageName = message.getAttribute("data-message");

      if (targetName === messageName) {
        let newErrorText = "";
        const attributeLength = targetName.length + 1;

        errorText.forEach((str, index) => {
          if (index > 0) {
            newErrorText += "、";
          }
          newErrorText += str.slice(attributeLength);
        });

        message.innerHTML = newErrorText;
      }
    });
  });
});

// 點擊送出預定資料按鈕
orderInfoBtn.addEventListener("click", function (e) {
  e.preventDefault();
  const isformCorrect = !validate(orderInfoForm, formConstraints);

  if (cartData.length === 0) {
    Swal.fire("購物車空空如也啊？ (｡ŏ_ŏ)");
    return;
  } else if (isformCorrect) {
    postOrder();
  } else {
    Swal.fire("資料填寫有誤 (゜皿。)");
  }
});
/* 一一一一一一一一一一 執行代碼區 ↑ 一一一一一一一一一一 */
