import {
  reactExtension,
  Banner,
  InlineStack,
  PaymentIcon,
  useSettings,
  useExtensionCapability,
  useBuyerJourneyIntercept,
  useShippingAddress,
  useSubtotalAmount,
} from "@shopify/ui-extensions-react/checkout";
import React, { useState } from "react";
// Set the entry point for the extension
const addressValidation = reactExtension("purchase.checkout.delivery-address.render-before", () => <App />);
export {addressValidation};

const deliveryMessage = reactExtension("purchase.checkout.block.render", () => <Shipping />);
export {deliveryMessage};

const paymentIconRender = reactExtension("purchase.checkout.payment-method-list.render-before", () => <PaymentIcons />);
export {paymentIconRender};

function App() {
  const shippingAddress = useShippingAddress();

  const [age, setAge] = useState("");
  const [validationError, setValidationError] = useState("");
  const canBlockProgress = useExtensionCapability("block_progress");

  useBuyerJourneyIntercept(({ canBlockProgress }) => {

    if (canBlockProgress && isAddressValid()) {
      return {
        behavior: "block",
        reason: `Shipping to this city is not possible!`,
        errors: [
          {
            message:
              "Can not ship to Packstation or Postfiliale!",
          },
        ],
      };
    }

    return {
      behavior: "allow",
      perform: () => {
        clearValidationErrors();
      },
    };
  });

  function isAddressValid() {
    console.log(shippingAddress);
    const countryCode = shippingAddress.countryCode;
    const cityName = shippingAddress.address1.toLowerCase();
    if (countryCode.toLowerCase() === 'at') {
      return cityName.includes('packstation') || cityName.includes('postfiliale');
    } else {
      return false;
    }
  }

  function clearValidationErrors() {
    setValidationError("");
  }
}

function Shipping() {
  const {
    title: merchantTitle,
    description,
    collapsible,
    status: merchantStatus,
  } = useSettings();

  const title = merchantTitle ?? "Custom Banner";

  const totalCost = useSubtotalAmount();

  const status = totalCost.amount > 1000 ? "success" : "info"; 

  if (totalCost.amount > 1000) {
    return (
      <Banner title="Congrats!!" status={status} collapsible={collapsible}>
        Free Delivery
      </Banner>
    );
  } else {
    return (
      <Banner title="Please check!!" status={status} collapsible={collapsible}>
        Please add {totalCost.currencyCode +' '+ Number(1000 - Number(totalCost.amount)).toFixed(2)} or more to get free shipping!
      </Banner>
    );
  }
}

function PaymentIcons() {
  const methods = ['visa', 'master', 'discover', 'american-express', 'diners-club', 'zoodpay', 'shop-pay']
  return (
    <>
      <InlineStack>
        {methods.map((method, i) => (
          <PaymentIcon key={i} name={method} />
        ))}
      </InlineStack>
    </>
  );
}