import {useEffect, useMemo, useState} from 'react';
import {LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer} from 'recharts';

type User = {id: string; email: string; name?: string};
type Watchlist = {id: string; name: string; symbols: string[]};
type Portfolio = {id: string; name: string; holdings: Array<{symbol: string; quantity: number; avgPrice: number}>};
type Alert = {id: string; name: string; targetType: string; targetRef: string; channels: string[]; rule: {direction: string; threshold: number; compareTo: string}};
type Report = {id: string; title: string; type: string; createdAt: string};

type Tab = 'dashboard' | 'analytics' | 'watchlists' | 'portfolios' | 'alerts' | 'reports';

const API_BASE = ((import.meta as unknown as {env?: {VITE_API_BASE?: string}}).env?.VITE_API_BASE) || 'http://localhost:4000/api';

const stockRanges = {
  day: [120, 125, 123, 129, 128, 132, 135],
  month: [100, 108, 112, 110, 118, 121, 127],
  sixMonth: [80, 85, 90, 96, 101, 110, 122],
  year: [60, 72, 78, 84, 88, 95, 111],
};

function createChartData(points: number[]) {
  return points.map((value, index) => ({label: `${index + 1}`, value}));
}

export default function App() {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [range, setRange] = useState<keyof typeof stockRanges>('month');
  const [watchlistName, setWatchlistName] = useState('');
  const [watchlistSymbols, setWatchlistSymbols] = useState('');
  const [portfolioName, setPortfolioName] = useState('');
  const [portfolioHoldings, setPortfolioHoldings] = useState('');
  const [alertName, setAlertName] = useState('');
  const [alertTargetRef, setAlertTargetRef] = useState('');
  const [alertType, setAlertType] = useState('stock');
  const [threshold, setThreshold] = useState('100');
  const [direction, setDirection] = useState<'up' | 'down'>('up');
  const [reportTitle, setReportTitle] = useState('Daily Stock Summary');
  const [message, setMessage] = useState('');

  const chartData = useMemo(() => createChartData(stockRanges[range]), [range]);

  async function authRequest(path: string, payload: Record<string, unknown>) {
    const response = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(payload),
    });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || 'Request failed');
    return body;
  }

  async function request<T>(path: string, init: RequestInit = {}) {
    const headers = new Headers(init.headers || {});
    if (token) headers.set('Authorization', `Bearer ${token}`);
    const response = await fetch(`${API_BASE}${path}`, {...init, headers});
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.error || 'Request failed');
    return body as T;
  }

  useEffect(() => {
    if (!token) return;
    Promise.all([
      request<Watchlist[]>('/watchlists'),
      request<Portfolio[]>('/portfolios'),
      request<Alert[]>('/alerts'),
      request<Report[]>('/reports'),
    ]).then(([watchlistsData, portfoliosData, alertsData, reportsData]) => {
      setWatchlists(watchlistsData);
      setPortfolios(portfoliosData);
      setAlerts(alertsData);
      setReports(reportsData);
    }).catch(() => setMessage('Unable to load your account data right now.'));
  }, [token]);

  async function handleAuth() {
    try {
      const body = await authRequest(`/auth/${authMode}`, {email, password, name});
      setToken(body.token);
      localStorage.setItem('token', body.token);
      setUser(body.user);
      setMessage(`${authMode === 'signup' ? 'Account created' : 'Signed in'} successfully.`);
    } catch (error) {
      setMessage((error as Error).message);
    }
  }

  async function handleCreateWatchlist() {
    const body = await request<Watchlist>('/watchlists', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({name: watchlistName, symbols: watchlistSymbols.split(',').map((item) => item.trim()).filter(Boolean)}),
    });
    setWatchlists((items) => [...items, body]);
    setWatchlistName('');
    setWatchlistSymbols('');
  }

  async function handleCreatePortfolio() {
    const holdings = portfolioHoldings.split(';').map((line) => line.trim()).filter(Boolean).map((line) => {
      const [symbol, quantity, avgPrice] = line.split(',');
      return {symbol: symbol.trim(), quantity: Number(quantity), avgPrice: Number(avgPrice)};
    });

    const body = await request<Portfolio>('/portfolios', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({name: portfolioName, holdings, metadata: {source: 'web-ui'}}),
    });
    setPortfolios((items) => [...items, body]);
    setPortfolioName('');
    setPortfolioHoldings('');
  }

  async function handleCreateAlert() {
    const body = await request<Alert>('/alerts', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        name: alertName,
        targetType: alertType,
        targetRef: alertTargetRef,
        rule: {direction, threshold: Number(threshold), compareTo: 'price'},
        channels: ['email', 'webhook'],
      }),
    });
    setAlerts((items) => [...items, body]);
  }

  async function handleGenerateReport() {
    const body = await request<Report>('/reports/generate', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({title: reportTitle, type: 'daily', parameters: {range}}),
    });
    setReports((items) => [body, ...items]);
    setMessage('Report generated and queued for delivery.');
  }

  async function handleExportWatchlists() {
    const data = await request<Watchlist[]>('/watchlists/export');
    const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'watchlists.json';
    link.click();
  }

  async function handleImportWatchlists(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const payload = JSON.parse(text);
    const data = await request<Watchlist[]>('/watchlists/import', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(payload),
    });
    setWatchlists((items) => [...items, ...data]);
  }

  async function handleExportPortfolios() {
    const data = await request<Portfolio[]>('/portfolios/export');
    const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'portfolios.json';
    link.click();
  }

  async function handleImportPortfolios(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const payload = JSON.parse(text);
    const data = await request<Portfolio[]>('/portfolios/import', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(payload),
    });
    setPortfolios((items) => [...items, ...data]);
  }

  function logout() {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setMessage('Signed out.');
  }

  const cards = [
    {label: 'Watchlists', value: watchlists.length.toString()},
    {label: 'Portfolios', value: portfolios.length.toString()},
    {label: 'Alerts', value: alerts.length.toString()},
    {label: 'Reports', value: reports.length.toString()},
  ];

  return (
    <div className="shell">
      <aside className="sidebar">
        <div>
          <p className="eyebrow">Stock Manager</p>
          <h1>Enterprise stock intelligence</h1>
          <p>Monitor watchlists, portfolios, alerts, and reports in one place.</p>
        </div>
        <nav className="nav">
          {(['dashboard', 'analytics', 'watchlists', 'portfolios', 'alerts', 'reports'] as Tab[]).map((item) => (
            <button key={item} className={tab === item ? 'nav-button active' : 'nav-button'} onClick={() => setTab(item)}>
              {item}
            </button>
          ))}
        </nav>
        {token ? (
          <button className="primary-button" onClick={logout}>Logout</button>
        ) : null}
      </aside>

      <main className="content">
        {message ? <div className="message-box">{message}</div> : null}

        {!token ? (
          <section className="panel auth-panel">
            <div>
              <h2>Sign in to your workspace</h2>
              <p>Use Google auth in the backend or email-based sign in.</p>
            </div>
            <div className="auth-grid">
              <label>
                Email
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="name@example.com" />
              </label>
              <label>
                Password
                <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="••••••••" />
              </label>
              {authMode === 'signup' ? (
                <label>
                  Name
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
                </label>
              ) : null}
              <div className="auth-actions">
                <button className="primary-button" onClick={handleAuth}>{authMode === 'signup' ? 'Create account' : 'Sign in'}</button>
                <button className="secondary-button" onClick={() => setAuthMode(authMode === 'signup' ? 'signin' : 'signup')}>
                  Switch to {authMode === 'signup' ? 'sign in' : 'sign up'}
                </button>
              </div>
            </div>
          </section>
        ) : null}

        {token && tab === 'dashboard' ? (
          <section className="grid-layout">
            {cards.map((card) => (
              <div key={card.label} className="panel stat-card">
                <p>{card.label}</p>
                <h2>{card.value}</h2>
              </div>
            ))}
            <div className="panel wide-panel">
              <h2>Account overview</h2>
              <p>Welcome back, {user?.name || user?.email}.</p>
              <p>Use the analytics and management tabs to explore watchlists, portfolios, alerts, and reports.</p>
            </div>
          </section>
        ) : null}

        {token && tab === 'analytics' ? (
          <section className="panel">
            <div className="section-header">
              <div>
                <h2>Market analytics</h2>
                <p>Compare stock movement across day, month, six month, and yearly ranges.</p>
              </div>
              <div className="range-buttons">
                {Object.keys(stockRanges).map((key) => (
                  <button key={key} className={range === key ? 'primary-button' : 'secondary-button'} onClick={() => setRange(key as keyof typeof stockRanges)}>
                    {key}
                  </button>
                ))}
              </div>
            </div>
            <div style={{height: 320}}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid stroke="#1f2937" strokeDasharray="5 5" />
                  <XAxis dataKey="label" stroke="#cbd5e1" />
                  <YAxis stroke="#cbd5e1" />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#38bdf8" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
        ) : null}

        {token && tab === 'watchlists' ? (
          <section className="panel">
            <h2>Watchlists</h2>
            <div className="form-grid">
              <label>
                Name
                <input value={watchlistName} onChange={(e) => setWatchlistName(e.target.value)} placeholder="My favourites" />
              </label>
              <label>
                Symbols
                <input value={watchlistSymbols} onChange={(e) => setWatchlistSymbols(e.target.value)} placeholder="INFY, TCS, HDFCBANK" />
              </label>
            </div>
            <div className="actions-row">
              <button className="primary-button" onClick={handleCreateWatchlist}>Create watchlist</button>
              <button className="secondary-button" onClick={handleExportWatchlists}>Export</button>
              <label className="secondary-button upload-label">
                Import
                <input type="file" accept="application/json" onChange={handleImportWatchlists} hidden />
              </label>
            </div>
            <div className="item-list">
              {watchlists.map((item) => (
                <div key={item.id} className="item-row">
                  <div>
                    <h3>{item.name}</h3>
                    <p>{item.symbols.join(', ') || 'No symbols yet'}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {token && tab === 'portfolios' ? (
          <section className="panel">
            <h2>Portfolios</h2>
            <div className="form-grid">
              <label>
                Name
                <input value={portfolioName} onChange={(e) => setPortfolioName(e.target.value)} placeholder="Growth portfolio" />
              </label>
              <label>
                Holdings
                <input value={portfolioHoldings} onChange={(e) => setPortfolioHoldings(e.target.value)} placeholder="INFY,10,200;TCS,5,320" />
              </label>
            </div>
            <div className="actions-row">
              <button className="primary-button" onClick={handleCreatePortfolio}>Create portfolio</button>
              <button className="secondary-button" onClick={handleExportPortfolios}>Export</button>
              <label className="secondary-button upload-label">
                Import
                <input type="file" accept="application/json" onChange={handleImportPortfolios} hidden />
              </label>
            </div>
            <div className="item-list">
              {portfolios.map((item) => (
                <div key={item.id} className="item-row">
                  <div>
                    <h3>{item.name}</h3>
                    <p>{item.holdings.length} holdings</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {token && tab === 'alerts' ? (
          <section className="panel">
            <h2>Notifications and alerts</h2>
            <div className="form-grid">
              <label>
                Alert name
                <input value={alertName} onChange={(e) => setAlertName(e.target.value)} placeholder="Price breakout" />
              </label>
              <label>
                Target
                <input value={alertTargetRef} onChange={(e) => setAlertTargetRef(e.target.value)} placeholder="INFY or watchlist id" />
              </label>
              <label>
                Target type
                <select value={alertType} onChange={(e) => setAlertType(e.target.value)}>
                  <option value="stock">stock</option>
                  <option value="watchlist">watchlist</option>
                  <option value="portfolio">portfolio</option>
                </select>
              </label>
              <label>
                Threshold
                <input value={threshold} onChange={(e) => setThreshold(e.target.value)} type="number" />
              </label>
              <label>
                Direction
                <select value={direction} onChange={(e) => setDirection(e.target.value as 'up' | 'down')}>
                  <option value="up">up</option>
                  <option value="down">down</option>
                </select>
              </label>
            </div>
            <button className="primary-button" onClick={handleCreateAlert}>Create alert</button>
            <div className="item-list">
              {alerts.map((item) => (
                <div key={item.id} className="item-row">
                  <div>
                    <h3>{item.name}</h3>
                    <p>{item.targetType}: {item.targetRef}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {token && tab === 'reports' ? (
          <section className="panel">
            <h2>Reports</h2>
            <div className="form-grid">
              <label>
                Report title
                <input value={reportTitle} onChange={(e) => setReportTitle(e.target.value)} placeholder="Weekly investor summary" />
              </label>
            </div>
            <button className="primary-button" onClick={handleGenerateReport}>Generate report</button>
            <div className="item-list">
              {reports.map((item) => (
                <div key={item.id} className="item-row">
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.type} • {new Date(item.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}
