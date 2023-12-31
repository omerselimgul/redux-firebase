import React, { useEffect, useState } from "react";
import { BarChart, WrapperContainer } from "../../components";
import { useDispatch, useSelector } from "react-redux";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import {
  decrementProduct,
  incrementProduct,
} from "../../redux/features/countOfProducts/counterOfProductsSlice";
import { IncreaseDecreaseButton } from "../../components/IncreaseDecreaseButton";
import Categories from "../../constant/Categories";

const WalletPage = () => {
  const wallet = useSelector((state) => state.wallet);
  const productsCollcetionRef = collection(db, "Products");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [chartData, setChartData] = useState();
  const countOfProducts = useSelector((state) => state.countOfProducts);
  const [totalAmount, setTotalAmount] = useState(0);
  const dispatch = useDispatch();

  useEffect(() => {
    getData();
  }, [countOfProducts]);

  useEffect(() => {
    let data = {};
    selectedProducts.map((pro) => {
      data = {
        ...data,
        [pro.Category]: data[pro.Category]
          ? data[pro.Category] + pro.Amount * pro.Price.replace(".", "")
          : pro.Amount * pro.Price.replace(".", ""),
      };
    });

    for (let i = 0; i < Categories.length; i++) {
      let CategoryId = Categories[i].id;
      if (!data[CategoryId]) {
        data[CategoryId] = "0 TL";
      }
      data = {
        ...data,
        [Categories[i].name]: data[CategoryId],
      };
      delete data[CategoryId];
    }
    setChartData(data);
  }, [selectedProducts]);

  const getData = async () => {
    const coll = await getDocs(productsCollcetionRef);
    const data = coll.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
    if (countOfProducts && data?.length > 0) {
      let selectedProducts = [];
      let totalamount = 0;
      data.map((pro) => {
        if (countOfProducts[pro.id]) {
          selectedProducts.push({
            ...pro,
            Amount: countOfProducts[pro.id],
            Stock: pro?.Stock - parseInt(countOfProducts[pro.id]),
          });
          totalamount += parseInt(countOfProducts[pro.id]);
        }
      });
      setTotalAmount(totalamount);
      setSelectedProducts([...selectedProducts]);
    }
  };
  const increaseHandler = (Product) => {
    dispatch(incrementProduct(Product.id));
  };
  const decreaseHandler = (Product) => {
    dispatch(decrementProduct(Product.id));
  };
  return (
    <React.Fragment>
      <WrapperContainer
        sx={{
          backgroundColor: "#edf9f8",
          padding: "1% 4%",
        }}
      >
        <div xs={2} className="navbar-right">
          <img alt="" src={"images/cuzdan.svg"}></img>
          <p>
            Cüzdanım{" "}
            <span className="backgroundColorSetForNumber">{wallet} TL</span>
          </p>
        </div>
      </WrapperContainer>
      <WrapperContainer
        sx={{
          padding: "0% 4%",
          color: "#349590",
        }}
        columnGap={2}
      >
        <div xs={7}>
          Sepetinizdeki Ürünler {totalAmount}
          {selectedProducts.length > 0 &&
            selectedProducts.map((pro) => (
              <WrapperContainer
                xs={12}
                sx={{
                  boxSizing: "border-box",
                  height: "150px",
                  border: "1px solid black",
                  color: "#349590",
                }}
                AlignItemsCenter
                ContentCenter
                // spacing={4}
              >
                <img xs={3} src={pro?.Path} height="130px" alt="" />
                <div xs={3}>
                  <h3>{pro.ProductName}</h3>
                  <h5>{pro.Stock} Adet Sınırlı</h5>
                </div>
                <IncreaseDecreaseButton
                  xs={3}
                  Amount={pro.Amount}
                  increaseHandler={() => increaseHandler(pro)}
                  decreaseHandler={() => decreaseHandler(pro)}
                />
                <h3 xs={3}>{pro?.Price} TL</h3>
              </WrapperContainer>
            ))}
        </div>
        <div xs={4}>
          Bakiye Bilgileri
          <WrapperContainer
            xs={12}
            sx={{
              border: "1px solid black",
              padding: "1% 5%",
            }}
            AlignItemsCenter
            // spacing={0}
          >
            <WrapperContainer xs={12} Height="30px">
              <span xs={8}>Toplam bakiyeniz :</span>
              <span xs={4} className="backgroundColorSetForNumber">
                {30000} TL
              </span>
            </WrapperContainer>
            <WrapperContainer xs={12} Height="30px">
              <span xs={8}>Toplam sepet tutarınız : </span>
              <span xs={4} className="backgroundColorSetForNumber">
                {30000 - parseInt(wallet)} TL
              </span>
            </WrapperContainer>
            <WrapperContainer xs={12} Height="30px">
              <span xs={8}>Toplam bakiyeniz :</span>
              <span xs={4} className="backgroundColorSetForNumber">
                {wallet} TL
              </span>
            </WrapperContainer>
          </WrapperContainer>
        </div>
      </WrapperContainer>
      <BarChart
        chartData={chartData}
        Amount={wallet ? 30000 - parseInt(wallet) : 0}
      />
    </React.Fragment>
  );
};

export default WalletPage;
