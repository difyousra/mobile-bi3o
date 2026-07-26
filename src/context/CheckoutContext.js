import { createContext, useContext, useMemo, useState } from "react";
import { useCart } from "./CartContext";
import {
  DEFAULT_ADDRESSES,
  DELIVERY_METHODS,
  PAYMENT_METHODS,
  VOUCHER_CODES,
} from "../data/buyFlow";

const CheckoutContext = createContext(null);

export function CheckoutProvider({ children }) {
  const { items, totals: cartTotals } = useCart();
  const [deliveryMethodId, setDeliveryMethodId] = useState("regular");
  const [addressId, setAddressId] = useState(null);
  const [paymentMethodId, setPaymentMethodId] = useState(null);
  const [addresses, setAddresses] = useState(DEFAULT_ADDRESSES);
  const [voucherCode, setVoucherCode] = useState(null);
  const [lastOrder, setLastOrder] = useState(null);

  const deliveryMethod =
    DELIVERY_METHODS.find((m) => m.id === deliveryMethodId) ?? DELIVERY_METHODS[2];
  const selectedAddress = addresses.find((a) => a.id === addressId) ?? null;
  const paymentMethod =
    PAYMENT_METHODS.find((m) => m.id === paymentMethodId) ?? null;
  const voucher = voucherCode ? VOUCHER_CODES[voucherCode] : null;

  const checkoutTotals = useMemo(() => {
    const subtotal = cartTotals.subtotal;
    const shipping = deliveryMethod.fee;
    const discount = voucher
      ? Math.round((subtotal * voucher.percent) / 100)
      : 0;
    const total = Math.max(0, subtotal + shipping - discount);
    return {
      subtotal,
      shipping,
      discount,
      total,
      count: cartTotals.count,
      voucherLabel: voucher?.label ?? null,
    };
  }, [cartTotals, deliveryMethod, voucher]);

  const applyVoucher = (code) => {
    const normalized = code.trim().toUpperCase();
    if (VOUCHER_CODES[normalized]) {
      setVoucherCode(normalized);
      return { ok: true, label: VOUCHER_CODES[normalized].label };
    }
    return { ok: false, message: "Code promo invalide" };
  };

  const clearVoucher = () => setVoucherCode(null);

  const addAddress = (address) => {
    const id = `addr-${Date.now()}`;
    const entry = { id, ...address };
    setAddresses((prev) => {
      const next = address.isDefault
        ? prev.map((a) => ({ ...a, isDefault: false }))
        : prev;
      return [...next, entry];
    });
    setAddressId(id);
    return entry;
  };

  const placeOrder = () => {
    const order = {
      id: `BI3OO-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString(),
      items: [...items],
      address: selectedAddress,
      paymentMethod,
      deliveryMethod,
      voucherCode,
      totals: checkoutTotals,
    };
    setLastOrder(order);
    return order;
  };

  const resetCheckout = () => {
    setAddressId(null);
    setPaymentMethodId(null);
    setVoucherCode(null);
    setDeliveryMethodId("regular");
  };

  const value = useMemo(
    () => ({
      deliveryMethodId,
      setDeliveryMethodId,
      deliveryMethod,
      addressId,
      setAddressId,
      selectedAddress,
      addresses,
      paymentMethodId,
      setPaymentMethodId,
      paymentMethod,
      voucherCode,
      voucher,
      applyVoucher,
      clearVoucher,
      addAddress,
      checkoutTotals,
      placeOrder,
      resetCheckout,
      lastOrder,
      deliveryMethods: DELIVERY_METHODS,
      paymentMethods: PAYMENT_METHODS,
    }),
    [
      deliveryMethodId,
      deliveryMethod,
      addressId,
      selectedAddress,
      addresses,
      paymentMethodId,
      paymentMethod,
      voucherCode,
      voucher,
      checkoutTotals,
      lastOrder,
    ]
  );

  return (
    <CheckoutContext.Provider value={value}>{children}</CheckoutContext.Provider>
  );
}

export function useCheckout() {
  const ctx = useContext(CheckoutContext);
  if (!ctx) {
    throw new Error("useCheckout must be used within CheckoutProvider");
  }
  return ctx;
}
