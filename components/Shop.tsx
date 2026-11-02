"use client";

import { useEffect, useMemo, useState } from "react";
import TiltCard from "./TiltCard";
import {
  CATEGORIES,
  DELIVERY_PRICE_PER_KM,
  STORE_CITY,
  PIX_CITY,
  PIX_KEY,
  PIX_NAME,
  PRODUCTS,
  WHATSAPP_NUMBER,
  formatBRL,
} from "@/lib/data";
import { buildPixPayload } from "@/lib/pix";
import { quoteDelivery } from "@/lib/delivery";

type Fulfillment = "retirada" | "entrega";
type Payment = "dinheiro" | "cartao" | "pix";

const PAYMENT_LABEL: Record<Payment, string> = {
  dinheiro: "Dinheiro",
  cartao: "Cartão (na entrega)",
  pix: "Pix",
};

function parseMoney(value: string) {
  const n = parseFloat(value.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

export default function Shop() {
  const [category, setCategory] = useState("Todos");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [open, setOpen] = useState(false);

  const [fulfillment, setFulfillment] = useState<Fulfillment>("retirada");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [payment, setPayment] = useState<Payment | null>(null);
  const [needsChange, setNeedsChange] = useState<boolean | null>(null);
  const [changeFor, setChangeFor] = useState("");
  const [copied, setCopied] = useState(false);
  const [triedSend, setTriedSend] = useState(false);

  // frete por km
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [distanceEstimated, setDistanceEstimated] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [deliveryError, setDeliveryError] = useState("");

  // se o endereço mudar, o frete calculado deixa de valer
  useEffect(() => {
    setDistanceKm(null);
    setDistanceEstimated(false);
    setDeliveryError("");
  }, [street, number, fulfillment]);

  const visible = useMemo(
    () =>
      category === "Todos"
        ? PRODUCTS
        : PRODUCTS.filter((p) => p.category === category),
    [category]
  );

  const items = PRODUCTS.filter((p) => cart[p.id]);
  const count = items.reduce((s, p) => s + cart[p.id], 0);
  const subtotal = items.reduce((s, p) => s + p.price * cart[p.id], 0);
  const isDelivery = fulfillment === "entrega";
  const deliveryFee =
    isDelivery && distanceKm !== null
      ? Math.round(distanceKm * DELIVERY_PRICE_PER_KM * 100) / 100
      : 0;
  const total = subtotal + deliveryFee;

  const pixCode = useMemo(() => {
    // o Pix só é gerado depois do frete, para já incluir a entrega no valor
    if (!isDelivery || payment !== "pix" || distanceKm === null || total <= 0)
      return "";
    return buildPixPayload({
      key: PIX_KEY,
      name: PIX_NAME,
      city: PIX_CITY,
      amount: total,
    });
  }, [isDelivery, payment, distanceKm, total]);

  const changeValue = parseMoney(changeFor);

  // validação
  const errors: string[] = [];
  if (items.length === 0) errors.push("Adicione ao menos um produto.");
  if (isDelivery) {
    if (!street.trim()) errors.push("Informe a rua.");
    if (!number.trim()) errors.push("Informe o número.");
    if (street.trim() && number.trim() && distanceKm === null)
      errors.push("Calcule o valor da entrega.");
    if (!payment) errors.push("Escolha a forma de pagamento.");
    if (payment === "dinheiro") {
      if (needsChange === null) errors.push("Informe se precisa de troco.");
      if (needsChange) {
        if (!changeValue) errors.push("Informe para quanto precisa de troco.");
        else if (changeValue < total)
          errors.push("O valor do troco deve ser maior ou igual ao total.");
      }
    }
  }

  const add = (id: string) => setCart((c) => ({ ...c, [id]: (c[id] ?? 0) + 1 }));
  const remove = (id: string) =>
    setCart((c) => {
      const next = { ...c };
      if (next[id] > 1) next[id] -= 1;
      else delete next[id];
      return next;
    });

  const calculateDelivery = async () => {
    if (!street.trim() || !number.trim()) {
      setDeliveryError("Preencha a rua e o número primeiro.");
      return;
    }
    setCalculating(true);
    setDeliveryError("");
    try {
      const quote = await quoteDelivery(street.trim(), number.trim(), STORE_CITY);
      setDistanceKm(quote.km);
      setDistanceEstimated(quote.estimated);
    } catch (e) {
      setDistanceKm(null);
      setDeliveryError(
        e instanceof Error && e.message.startsWith("Não encontramos")
          ? e.message
          : "Não foi possível calcular agora. Tente novamente em instantes."
      );
    } finally {
      setCalculating(false);
    }
  };

  const choosePayment = (p: Payment) => {
    setPayment(p);
    setNeedsChange(null);
    setChangeFor("");
    setCopied(false);
  };

  const copyPix = async () => {
    try {
      await navigator.clipboard.writeText(pixCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  const sendOrder = () => {
    setTriedSend(true);
    if (errors.length > 0) return;

    const lines = items.map(
      (p) => `• ${cart[p.id]}x ${p.name} — ${formatBRL(p.price * cart[p.id])}`
    );

    const parts: string[] = [
      "Olá! Gostaria de fazer um pedido na FarmaVida:",
      "",
      lines.join("\n"),
      "",
      `Produtos: ${formatBRL(subtotal)}`,
      ...(isDelivery
        ? [
            `Entrega (${distanceKm?.toLocaleString("pt-BR")} km x ${formatBRL(
              DELIVERY_PRICE_PER_KM
            )}): ${formatBRL(deliveryFee)}`,
          ]
        : []),
      `*Total: ${formatBRL(total)}*`,
      "",
    ];

    if (!isDelivery) {
      parts.push("🏪 *Retirada na loja*");
    } else {
      parts.push("🛵 *Entrega*");
      parts.push(
        `Endereço: ${street.trim()}, ${number.trim()}${
          complement.trim() ? ` - ${complement.trim()}` : ""
        }`
      );
      parts.push(`Pagamento: ${payment ? PAYMENT_LABEL[payment] : ""}`);
      if (payment === "dinheiro") {
        parts.push(
          needsChange
            ? `Troco para: ${formatBRL(changeValue)} (levar ${formatBRL(
                changeValue - total
              )} de troco)`
            : "Não precisa de troco"
        );
      }
      if (payment === "pix") {
        parts.push("Pix: vou pagar pelo copia e cola e enviar o comprovante.");
      }
    }

    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
        parts.join("\n")
      )}`,
      "_blank"
    );
  };

  return (
    <>
      <div className="filters">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            className={`chip ${c === category ? "active" : ""}`}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid products">
        {visible.map((p) => (
          <TiltCard key={p.id} className="card product">
            {p.tag && <span className="badge">{p.tag}</span>}
            <div className="product-emoji">{p.emoji}</div>
            <h3>{p.name}</h3>
            <p className="muted">{p.category}</p>
            <div className="product-foot">
              <strong>{formatBRL(p.price)}</strong>
              <button className="btn small" onClick={() => add(p.id)}>
                Adicionar
              </button>
            </div>
          </TiltCard>
        ))}
      </div>

      <button
        className="cart-fab"
        onClick={() => setOpen(true)}
        aria-label="Abrir carrinho"
      >
        🛒 {count > 0 && <span className="cart-count">{count}</span>}
      </button>

      {open && (
        <div className="drawer-backdrop" onClick={() => setOpen(false)}>
          <aside className="drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-head">
              <h3>Seu pedido</h3>
              <button className="icon-btn" onClick={() => setOpen(false)}>
                ✕
              </button>
            </div>

            <div className="drawer-body">
              {items.length === 0 ? (
                <p className="muted">Seu carrinho está vazio.</p>
              ) : (
                <ul className="cart-list">
                  {items.map((p) => (
                    <li key={p.id}>
                      <div>
                        <strong>{p.name}</strong>
                        <span className="muted">{formatBRL(p.price)} cada</span>
                      </div>
                      <div className="qty">
                        <button onClick={() => remove(p.id)}>−</button>
                        <span>{cart[p.id]}</span>
                        <button onClick={() => add(p.id)}>+</button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {items.length > 0 && (
                <>
                  <fieldset className="field-group">
                    <legend>Como você quer receber?</legend>
                    <div className="options">
                      <button
                        type="button"
                        className={`option ${!isDelivery ? "selected" : ""}`}
                        onClick={() => setFulfillment("retirada")}
                      >
                        🏪 Retirar na loja
                      </button>
                      <button
                        type="button"
                        className={`option ${isDelivery ? "selected" : ""}`}
                        onClick={() => setFulfillment("entrega")}
                      >
                        🛵 Entrega
                      </button>
                    </div>
                  </fieldset>

                  {isDelivery && (
                    <>
                      <fieldset className="field-group">
                        <legend>Endereço de entrega</legend>
                        <label className="field">
                          <span>Rua *</span>
                          <input
                            value={street}
                            onChange={(e) => setStreet(e.target.value)}
                            placeholder="Ex.: Rua das Flores"
                            autoComplete="street-address"
                          />
                        </label>
                        <div className="field-row">
                          <label className="field">
                            <span>Número *</span>
                            <input
                              value={number}
                              onChange={(e) => setNumber(e.target.value)}
                              placeholder="123"
                              inputMode="numeric"
                            />
                          </label>
                          <label className="field grow">
                            <span>Complemento (opcional)</span>
                            <input
                              value={complement}
                              onChange={(e) => setComplement(e.target.value)}
                              placeholder="Apto, bloco, referência…"
                            />
                          </label>
                        </div>

                        <button
                          type="button"
                          className="btn small"
                          onClick={calculateDelivery}
                          disabled={calculating}
                        >
                          {calculating
                            ? "Calculando…"
                            : distanceKm === null
                            ? "Calcular valor da entrega"
                            : "Recalcular entrega"}
                        </button>

                        {deliveryError && (
                          <p className="hint error-text">{deliveryError}</p>
                        )}

                        {distanceKm !== null && (
                          <p className="delivery-result">
                            📍 {distanceKm.toLocaleString("pt-BR")} km
                            {distanceEstimated ? " (estimativa)" : ""} ×{" "}
                            {formatBRL(DELIVERY_PRICE_PER_KM)} ={" "}
                            <strong>{formatBRL(deliveryFee)}</strong>
                          </p>
                        )}
                      </fieldset>

                      <fieldset className="field-group">
                        <legend>Forma de pagamento</legend>
                        <div className="options three">
                          {(Object.keys(PAYMENT_LABEL) as Payment[]).map((p) => (
                            <button
                              key={p}
                              type="button"
                              className={`option ${
                                payment === p ? "selected" : ""
                              }`}
                              onClick={() => choosePayment(p)}
                            >
                              {p === "dinheiro" && "💵 Dinheiro"}
                              {p === "cartao" && "💳 Cartão"}
                              {p === "pix" && "⚡ Pix"}
                            </button>
                          ))}
                        </div>

                        {payment === "cartao" && (
                          <p className="hint">
                            Você paga com cartão (crédito ou débito) na maquininha
                            quando o entregador chegar.
                          </p>
                        )}

                        {payment === "dinheiro" && (
                          <div className="sub">
                            <p className="sub-title">Vai precisar de troco?</p>
                            <div className="options">
                              <button
                                type="button"
                                className={`option ${
                                  needsChange === false ? "selected" : ""
                                }`}
                                onClick={() => {
                                  setNeedsChange(false);
                                  setChangeFor("");
                                }}
                              >
                                Não
                              </button>
                              <button
                                type="button"
                                className={`option ${
                                  needsChange === true ? "selected" : ""
                                }`}
                                onClick={() => setNeedsChange(true)}
                              >
                                Sim
                              </button>
                            </div>
                            {needsChange && (
                              <label className="field">
                                <span>Troco para quanto?</span>
                                <input
                                  value={changeFor}
                                  onChange={(e) => setChangeFor(e.target.value)}
                                  placeholder="Ex.: 50,00"
                                  inputMode="decimal"
                                />
                                {changeValue >= total && changeValue > 0 && (
                                  <small className="hint">
                                    Troco a receber:{" "}
                                    {formatBRL(changeValue - total)}
                                  </small>
                                )}
                              </label>
                            )}
                          </div>
                        )}

                        {payment === "pix" && !pixCode && (
                          <p className="hint">
                            Calcule o valor da entrega acima para gerar o código
                            Pix com o total correto.
                          </p>
                        )}

                        {payment === "pix" && pixCode && (
                          <div className="sub">
                            <p className="sub-title">
                              Pix copia e cola ({formatBRL(total)})
                            </p>
                            <textarea
                              className="pix-code"
                              readOnly
                              value={pixCode}
                              rows={4}
                              onFocus={(e) => e.currentTarget.select()}
                            />
                            <button
                              type="button"
                              className="btn small"
                              onClick={copyPix}
                            >
                              {copied ? "✓ Código copiado!" : "Copiar código Pix"}
                            </button>
                            <p className="hint">
                              Cole no app do seu banco, pague e envie o
                              comprovante pelo WhatsApp junto com o pedido.
                            </p>
                          </div>
                        )}
                      </fieldset>
                    </>
                  )}
                </>
              )}
            </div>

            <div className="drawer-foot">
              {triedSend && errors.length > 0 && (
                <ul className="errors">
                  {errors.map((e) => (
                    <li key={e}>{e}</li>
                  ))}
                </ul>
              )}
              {isDelivery && (
                <div className="subline">
                  <span>Produtos</span>
                  <span>{formatBRL(subtotal)}</span>
                </div>
              )}
              {isDelivery && (
                <div className="subline">
                  <span>
                    Entrega
                    {distanceKm !== null &&
                      ` (${distanceKm.toLocaleString("pt-BR")} km)`}
                  </span>
                  <span>
                    {distanceKm === null ? "a calcular" : formatBRL(deliveryFee)}
                  </span>
                </div>
              )}
              <div className="total">
                <span>Total</span>
                <strong>{formatBRL(total)}</strong>
              </div>
              <button
                className="btn"
                disabled={items.length === 0}
                onClick={sendOrder}
              >
                Pedir pelo WhatsApp
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
