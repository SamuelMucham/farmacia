import HeroScene from "@/components/HeroScene";
import Shop from "@/components/Shop";
import TiltCard from "@/components/TiltCard";
import { SERVICES, WHATSAPP_NUMBER } from "@/lib/data";

export default function Home() {
  return (
    <main>
      <header className="nav">
        <a href="#inicio" className="logo">
          <span className="logo-cross">✚</span> FarmaVida
        </a>
        <nav>
          <a href="#produtos">Produtos</a>
          <a href="#servicos">Serviços</a>
          <a href="#sobre">Sobre</a>
          <a href="#contato">Contato</a>
        </nav>
      </header>

      <section id="inicio" className="hero">
        <HeroScene />
        <div className="hero-text">
          <span className="eyebrow">Farmácia · Drogaria · Manipulação</span>
          <h1>
            Sua saúde em <em>todas as dimensões</em>
          </h1>
          <p>
            Medicamentos, vitaminas e dermocosméticos com atendimento
            farmacêutico de verdade e entrega rápida na sua porta.
          </p>
          <div className="hero-actions">
            <a href="#produtos" className="btn">
              Ver produtos
            </a>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noreferrer"
              className="btn ghost"
            >
              Falar no WhatsApp
            </a>
          </div>
        </div>
        <div className="scroll-hint">Role para explorar ↓</div>
      </section>

      <section id="produtos" className="section">
        <h2>Nossos produtos</h2>
        <p className="lead">
          Monte seu pedido e envie direto para o nosso WhatsApp.
        </p>
        <Shop />
      </section>

      <section id="servicos" className="section alt">
        <h2>Serviços</h2>
        <p className="lead">Mais do que balcão: cuidado com a sua saúde.</p>
        <div className="grid services">
          {SERVICES.map((s) => (
            <TiltCard key={s.title} className="card service">
              <div className="service-icon">{s.icon}</div>
              <h3>{s.title}</h3>
              <p className="muted">{s.text}</p>
            </TiltCard>
          ))}
        </div>
      </section>

      <section id="sobre" className="section">
        <div className="about">
          <div>
            <h2>Cuidado de vizinhança, tecnologia de ponta</h2>
            <p className="lead left">
              A FarmaVida une o atendimento próximo de uma farmácia de bairro
              com praticidade digital. Nossa equipe de farmacêuticos está
              pronta para orientar você sobre o uso correto dos medicamentos.
            </p>
          </div>
          <div className="stats">
            <div className="stat">
              <strong>+15</strong>
              <span>anos de experiência</span>
            </div>
            <div className="stat">
              <strong>+5 mil</strong>
              <span>produtos</span>
            </div>
            <div className="stat">
              <strong>30 min</strong>
              <span>entrega média</span>
            </div>
          </div>
        </div>
      </section>

      <section id="contato" className="section alt">
        <h2>Contato</h2>
        <div className="grid contact">
          <div className="card">
            <h3>📍 Endereço</h3>
            <p className="muted">
              Rua Marcos Bertoldi, 869 — Campo de Santana, Curitiba/PR
              <br />
              CEP 81490-530
            </p>
          </div>
          <div className="card">
            <h3>🕒 Horário</h3>
            <p className="muted">Seg a Sáb: 7h às 22h · Dom: 8h às 20h</p>
          </div>
          <div className="card">
            <h3>💬 WhatsApp</h3>
            <p className="muted">
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noreferrer"
              >
                Chamar agora
              </a>
            </p>
          </div>
        </div>
      </section>

      <footer className="footer">
        © {new Date().getFullYear()} FarmaVida. Medicamentos podem causar
        efeitos indesejados. Siga as orientações do farmacêutico e do médico.
      </footer>
    </main>
  );
}
