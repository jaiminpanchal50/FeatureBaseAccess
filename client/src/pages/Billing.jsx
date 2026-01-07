import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { can } from '../utils/permissions';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Table from '../components/common/Table';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';

const Billing = () => {
  const { permissions } = useAuth();
  const [billingRecords, setBillingRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Mock billing data - replace with actual API call
  useEffect(() => {
    setTimeout(() => {
      setBillingRecords([
        {
          id: 1,
          user: 'John Doe',
          email: 'john@example.com',
          plan: 'Professional',
          amount: '$99.00',
          status: 'Paid',
          dueDate: '2024-02-01',
          invoice: 'INV-2024-001',
        },
        {
          id: 2,
          user: 'Jane Smith',
          email: 'jane@example.com',
          plan: 'Enterprise',
          amount: '$299.00',
          status: 'Pending',
          dueDate: '2024-01-25',
          invoice: 'INV-2024-002',
        },
        {
          id: 3,
          user: 'Bob Johnson',
          email: 'bob@example.com',
          plan: 'Basic',
          amount: '$49.00',
          status: 'Overdue',
          dueDate: '2024-01-15',
          invoice: 'INV-2024-003',
        },
        {
          id: 4,
          user: 'Alice Williams',
          email: 'alice@example.com',
          plan: 'Professional',
          amount: '$99.00',
          status: 'Paid',
          dueDate: '2024-02-05',
          invoice: 'INV-2024-004',
        },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const handleManageBilling = (record) => {
    if (!can(permissions, 'billing.manage')) {
      alert('You do not have permission to manage billing');
      return;
    }
    setSelectedRecord(record);
    setPaymentModalOpen(true);
  };

  const handleUpdatePayment = () => {
    // Simulate payment update
    alert(`Updating payment for ${selectedRecord?.invoice}...`);
    setPaymentModalOpen(false);
    setSelectedRecord(null);
  };

  if (!can(permissions, 'billing.view')) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Access Denied
          </h2>
          <p className="text-slate-600">
            You don't have permission to view billing information.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Loading billing records...</div>
      </div>
    );
  }

  const headers = ['User', 'Plan', 'Amount', 'Status', 'Due Date', 'Invoice', 'Actions'];

  const renderRow = (record) => (
    <>
      <td className="px-3 sm:px-6 py-4">
        <div>
          <div className="text-xs sm:text-sm font-medium text-slate-900 truncate">{record.user}</div>
          <div className="text-xs sm:text-sm text-slate-500 truncate">{record.email}</div>
        </div>
      </td>
      <td className="px-3 sm:px-6 py-4">
        <Badge variant="primary" className="text-xs">{record.plan}</Badge>
      </td>
      <td className="px-3 sm:px-6 py-4">
        <div className="text-xs sm:text-sm font-medium text-slate-900">{record.amount}</div>
      </td>
      <td className="px-3 sm:px-6 py-4">
        <Badge
          variant={
            record.status === 'Paid'
              ? 'success'
              : record.status === 'Pending'
              ? 'warning'
              : 'danger'
          }
          className="text-xs"
        >
          {record.status}
        </Badge>
      </td>
      <td className="px-3 sm:px-6 py-4">
        <div className="text-xs sm:text-sm text-slate-600">{record.dueDate}</div>
      </td>
      <td className="px-3 sm:px-6 py-4">
        <div className="text-xs sm:text-sm text-slate-600 font-mono truncate">{record.invoice}</div>
      </td>
      <td className="px-3 sm:px-6 py-4 text-sm">
        {can(permissions, 'billing.manage') && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleManageBilling(record)}
            className="text-xs sm:text-sm"
          >
            Manage
          </Button>
        )}
      </td>
    </>
  );

  const paidCount = billingRecords.filter((r) => r.status === 'Paid').length;
  const pendingCount = billingRecords.filter((r) => r.status === 'Pending').length;
  const overdueCount = billingRecords.filter((r) => r.status === 'Overdue').length;
  const totalRevenue = billingRecords
    .filter((r) => r.status === 'Paid')
    .reduce((sum, r) => sum + parseFloat(r.amount.replace('$', '')), 0);

  return (
    <div>
      <div className="mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Billing</h2>
          <p className="text-sm sm:text-base text-slate-600 mt-1">Manage billing and subscription plans</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Revenue</p>
              <p className="text-2xl font-bold text-slate-900 mt-2">
                ${totalRevenue.toFixed(2)}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Paid</p>
              <p className="text-2xl font-bold text-slate-900 mt-2">{paidCount}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Pending</p>
              <p className="text-2xl font-bold text-slate-900 mt-2">{pendingCount}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Overdue</p>
              <p className="text-2xl font-bold text-slate-900 mt-2">{overdueCount}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Billing Records Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
        <Table
          headers={headers}
          data={billingRecords}
          renderRow={renderRow}
          emptyMessage="No billing records found"
        />
      </div>

      {/* Subscription Plans */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-4">
          Available Plans
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="border border-slate-200 rounded-lg p-6">
            <h4 className="font-semibold text-slate-900 mb-2">Basic</h4>
            <div className="text-3xl font-bold text-slate-900 mb-4">$49<span className="text-lg text-slate-600">/mo</span></div>
            <ul className="space-y-2 text-sm text-slate-600 mb-6">
              <li>✓ Up to 10 users</li>
              <li>✓ Basic reports</li>
              <li>✓ Email support</li>
            </ul>
            <Button variant="outline" className="w-full" size="sm">
              Select Plan
            </Button>
          </div>

          <div className="border-2 border-primary-600 rounded-lg p-6 relative">
            <div className="absolute top-0 right-0 bg-primary-600 text-white text-xs px-3 py-1 rounded-bl-lg">
              Popular
            </div>
            <h4 className="font-semibold text-slate-900 mb-2">Professional</h4>
            <div className="text-3xl font-bold text-slate-900 mb-4">$99<span className="text-lg text-slate-600">/mo</span></div>
            <ul className="space-y-2 text-sm text-slate-600 mb-6">
              <li>✓ Up to 50 users</li>
              <li>✓ Advanced reports</li>
              <li>✓ Priority support</li>
              <li>✓ API access</li>
            </ul>
            <Button variant="primary" className="w-full" size="sm">
              Select Plan
            </Button>
          </div>

          <div className="border border-slate-200 rounded-lg p-6">
            <h4 className="font-semibold text-slate-900 mb-2">Enterprise</h4>
            <div className="text-3xl font-bold text-slate-900 mb-4">$299<span className="text-lg text-slate-600">/mo</span></div>
            <ul className="space-y-2 text-sm text-slate-600 mb-6">
              <li>✓ Unlimited users</li>
              <li>✓ Custom reports</li>
              <li>✓ 24/7 support</li>
              <li>✓ Custom integrations</li>
            </ul>
            <Button variant="outline" className="w-full" size="sm">
              Select Plan
            </Button>
          </div>
        </div>
      </div>

      {/* Payment Management Modal */}
      <Modal
        isOpen={paymentModalOpen}
        onClose={() => {
          setPaymentModalOpen(false);
          setSelectedRecord(null);
        }}
        title={`Manage Payment - ${selectedRecord?.invoice}`}
      >
        {selectedRecord && (
          <div className="space-y-4">
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-600">User</p>
                  <p className="font-medium text-slate-900">{selectedRecord.user}</p>
                </div>
                <div>
                  <p className="text-slate-600">Plan</p>
                  <p className="font-medium text-slate-900">{selectedRecord.plan}</p>
                </div>
                <div>
                  <p className="text-slate-600">Amount</p>
                  <p className="font-medium text-slate-900">{selectedRecord.amount}</p>
                </div>
                <div>
                  <p className="text-slate-600">Status</p>
                  <Badge
                    variant={
                      selectedRecord.status === 'Paid'
                        ? 'success'
                        : selectedRecord.status === 'Pending'
                        ? 'warning'
                        : 'danger'
                    }
                  >
                    {selectedRecord.status}
                  </Badge>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Payment Status
              </label>
              <select
                defaultValue={selectedRecord.status}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Overdue">Overdue</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Payment Date
              </label>
              <Input
                type="date"
                name="paymentDate"
                defaultValue={selectedRecord.dueDate}
              />
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-200">
              <Button
                variant="outline"
                onClick={() => {
                  setPaymentModalOpen(false);
                  setSelectedRecord(null);
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleUpdatePayment}
                className="flex-1"
              >
                Update Payment
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Billing;

