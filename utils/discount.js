// let suppose we have a list contains the promotions

const promotions = [
  {
    code: "xx1320",
    type: "percent",
    value: 10,
  },
  {
    code: "xF3X20",
    type: "fixed",
    value: 20,
  },
];

// total :
// code : the code to select the the current availaible discount
function applyDiscount(total, code) {
  const promo_type = promotions.find((promo) => promo.code === code);
  if (!promo_type) {
    return { total, discount: 0 };
  }
  let discount = 0; // initial
  if (promo_type.type === "percent") {
    discount = total * (promo_type.value / 100);
  }
  if (promo_type.type === "fixed") {
    discount = promo_type.value;
  }

  return { total: total - discount, discount };
}

module.exports = applyDiscount;
