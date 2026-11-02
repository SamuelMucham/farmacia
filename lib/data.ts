export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  emoji: string;
  tag?: string;
};

// Número de WhatsApp de exemplo (DDI + DDD + número). Troque pelo número real da farmácia.
export const WHATSAPP_NUMBER = "5541999999999";

// Dados do Pix da farmácia. Troque pela chave real (CPF/CNPJ, e-mail, telefone ou chave aleatória).
export const PIX_KEY = "pix@farmavida.com.br";
export const PIX_NAME = "FarmaVida";
export const PIX_CITY = "Curitiba";

// Entrega: valor cobrado por km e localização da loja.
// O ponto de partida é localizado automaticamente a partir do endereço da loja.
export const DELIVERY_PRICE_PER_KM = 3;
export const STORE_STREET = "Rua Marcos Bertoldi";
export const STORE_NUMBER = "869";
export const STORE_CEP = "81490-530";
export const STORE_CITY = "Curitiba, Paraná";

export const CATEGORIES = [
  "Todos",
  "Medicamentos",
  "Vitaminas",
  "Dermocosméticos",
  "Higiene",
  "Infantil",
];

export const PRODUCTS: Product[] = [
  { id: "p1", name: "Analgésico 500mg (20 comp.)", category: "Medicamentos", price: 12.9, emoji: "💊", tag: "Mais vendido" },
  { id: "p2", name: "Antialérgico 10mg (12 comp.)", category: "Medicamentos", price: 24.5, emoji: "🤧" },
  { id: "p3", name: "Soro Fisiológico 500ml", category: "Medicamentos", price: 8.9, emoji: "💧" },
  { id: "p4", name: "Vitamina C 1g (30 efervescentes)", category: "Vitaminas", price: 29.9, emoji: "🍊", tag: "Oferta" },
  { id: "p5", name: "Vitamina D 2000UI (60 cáps.)", category: "Vitaminas", price: 39.9, emoji: "☀️" },
  { id: "p6", name: "Ômega 3 (60 cáps.)", category: "Vitaminas", price: 54.9, emoji: "🐟" },
  { id: "p7", name: "Protetor Solar FPS 60", category: "Dermocosméticos", price: 62.0, emoji: "🧴", tag: "Oferta" },
  { id: "p8", name: "Hidratante Facial Ácido Hialurônico", category: "Dermocosméticos", price: 79.9, emoji: "✨" },
  { id: "p9", name: "Sabonete Líquido Antisséptico", category: "Higiene", price: 14.5, emoji: "🧼" },
  { id: "p10", name: "Álcool em Gel 70% 500ml", category: "Higiene", price: 11.9, emoji: "🫧" },
  { id: "p11", name: "Fralda Descartável M (40 un.)", category: "Infantil", price: 49.9, emoji: "👶" },
  { id: "p12", name: "Termômetro Digital Infantil", category: "Infantil", price: 27.9, emoji: "🌡️" },
];

export const SERVICES = [
  { icon: "🧪", title: "Manipulação", text: "Fórmulas personalizadas com receita, preparadas por farmacêuticos." },
  { icon: "💉", title: "Aplicação de Injetáveis", text: "Atendimento rápido e seguro, com profissional habilitado." },
  { icon: "🩺", title: "Aferição de Pressão e Glicemia", text: "Cuide da saúde com acompanhamento simples e gratuito." },
  { icon: "🛵", title: "Entrega Rápida", text: "Receba em casa no mesmo dia, direto do balcão da farmácia." },
  { icon: "💬", title: "Atendimento Farmacêutico", text: "Tire dúvidas sobre uso de medicamentos e interações." },
  { icon: "🏷️", title: "Clube de Descontos", text: "Cadastre-se e ganhe vantagens em produtos selecionados." },
];

export function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
