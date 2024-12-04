let productData = [];
let str = "";
const productList = document.querySelector(".productWrap");

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
  str = "";

  productData.forEach(({ images, title, origin_price, price }) => {
    str += `
    <li class="productCard">
      <h4 class="productType">新品</h4>
      <img src="${images}" alt=""/>
      <a href="#" class="addCardBtn">加入購物車</a>
      <h3>${title}</h3>
      <del class="originPrice">NT$${addThousandths(origin_price)}</del>
      <p class="nowPrice">NT$${addThousandths(price)}</p>
    </li>`;
  });

  productList.innerHTML = str;
};

// 初始化
const init = () => {
  getProductList();
};

init();
