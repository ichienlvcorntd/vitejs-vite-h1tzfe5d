import { useEffect, useMemo, useState } from 'react';
import './App.css';
import suzukiLogo from './assets/suzuki.png'
const CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vTmX8wOuEbK1PlUc4nM6J7fS2SE5ii6Teicw1vsnzrca0xtwzDvp0gG4sfnS9R0URHDgVjKwtHmDis9/pub?gid=379826776&single=true&output=csv';

type Product = {
  name: string;
  model: string;
  price: string;
  status: string;
  link: string;
  image: string;
  search: string;
};

function parseCSV(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quote = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const n = text[i + 1];

    if (c === '"' && quote && n === '"') {
      cell += '"';
      i++;
    } else if (c === '"') {
      quote = !quote;
    } else if (c === ',' && !quote) {
      row.push(cell);
      cell = '';
    } else if ((c === '\n' || c === '\r') && !quote) {
      if (cell || row.length) {
        row.push(cell);
        rows.push(row);
        row = [];
        cell = '';
      }
    } else {
      cell += c;
    }
  }

  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }

  return rows;
}

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [q, setQ] = useState('');
  const [model, setModel] = useState('Tất cả');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(CSV_URL)
      .then((res) => res.text())
      .then((text) => {
        const rows = parseCSV(text).slice(1);
        const data = rows
          .map((r) => ({
            name: r[0] || '',
            model: r[1] || '',
            price: r[2] || '',
            status: r[3] || '',
            link: r[4] || '',
            image: r[5] || '',
            search: r[6] || '',
          }))
          .filter((p) => p.name);
        setProducts(data);
      })
      .finally(() => setLoading(false));
  }, []);

  const models = useMemo(() => {
    const list = products.map((p) => p.model).filter(Boolean);
    return ['Tất cả', ...Array.from(new Set(list))];
  }, [products]);

  const filtered = products.filter((p) => {
    const text = `${p.name} ${p.model} ${p.price} ${p.search}`.toLowerCase();
    const okSearch = text.includes(q.toLowerCase());
    const okModel = model === 'Tất cả' || p.model === model;
    return okSearch && okModel;
  });

  return (
    <main className="app">
      <header className="header">
      <div className="brand">
    <img
      src={suzukiLogo}
      alt="Suzuki"
      className="brand-logo"
    />

    <div className="brand-text">
      <h1>Suzuki Toàn Phát</h1>

      <p className="hero-sub">
        Tổng kho phụ tùng chính hãng
      </p>

      <p className="hero-count">
        {products.length} sản phẩm
      </p>

      <p className="hero-phone">
        ☎ Hotline/Zalo: 0865316207
      </p>
    </div>
  </div>
</header>

      <section className="controls">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Tìm sản phẩm, dòng xe..."
        />

        <select value={model} onChange={(e) => setModel(e.target.value)}>
          {models.map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>
      </section>

      {loading && <div className="empty">Đang tải dữ liệu...</div>}

      {!loading && (
        <section className="grid">
          {filtered.map((p, i) => (
            <article className="card" key={`${p.name}-${i}`}>
              {p.image ? (
                <img src={p.image} alt={p.name} />
              ) : (
                <div className="noimg">Chưa có ảnh</div>
              )}

              <div className="content">
                <h2>{p.name}</h2>
                <p className="model">{p.model || 'Chưa phân loại'}</p>
                <p className="price">{p.price}</p>
                <p className="status">{p.status}</p>

                <div className="contact-buttons">
  <a
    href="tel:0865316207"
    className="contact-btn"
  >
    📞 Gọi ngay
  </a>

  <a
    href="https://zalo.me/0865316207"
    target="_blank"
    className="contact-btn"
  >
    💬 Zalo
  </a>

  <a
    href="https://www.facebook.com/phuongnghi.trieuhoang"
    target="_blank"
    className="contact-btn"
  >
    ⓕ Facebook
  </a>
</div>
              </div>
            </article>
          ))}
        </section>
      )}

      {!loading && filtered.length === 0 && (
        <div className="empty">Không tìm thấy sản phẩm</div>
      )}
    </main>
  );
}
