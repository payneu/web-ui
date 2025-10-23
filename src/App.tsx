import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WalletProvider } from './providers/WalletProvider';
import Homepage from './pages/Homepage';
import AdminLayout from './layouts/AdminLayout';
import InvoicePage from './pages/InvoicePage';
import InvoiceManagement from './pages/admin/InvoiceManagement';
import TokenManagement from './pages/admin/TokenManagement';
import Faucet from './pages/admin/Faucet';

function App() {
  return (
    <WalletProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/invoice/:id" element={<InvoicePage />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<InvoiceManagement />} />
            <Route path="invoices" element={<InvoiceManagement />} />
            <Route path="tokens" element={<TokenManagement />} />
            <Route path="faucet" element={<Faucet />} />
          </Route>
        </Routes>
      </Router>
    </WalletProvider>
  );
}

export default App;