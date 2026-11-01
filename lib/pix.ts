// Gera o payload "Pix copia e cola" (BR Code estático, padrão EMV do Banco Central)

function tlv(id: string, value: string) {
  return id + String(value.length).padStart(2, "0") + value;
}

function crc16(payload: string) {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function clean(text: string, max: number) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9 ]/g, "")
    .toUpperCase()
    .slice(0, max);
}

export function buildPixPayload({
  key,
  name,
  city,
  amount,
  txid = "***",
}: {
  key: string;
  name: string;
  city: string;
  amount: number;
  txid?: string;
}) {
  const account = tlv("00", "br.gov.bcb.pix") + tlv("01", key);
  const payload =
    tlv("00", "01") +
    tlv("26", account) +
    tlv("52", "0000") +
    tlv("53", "986") +
    tlv("54", amount.toFixed(2)) +
    tlv("58", "BR") +
    tlv("59", clean(name, 25)) +
    tlv("60", clean(city, 15)) +
    tlv("62", tlv("05", txid)) +
    "6304";

  return payload + crc16(payload);
}
