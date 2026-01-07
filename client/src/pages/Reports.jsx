import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { can } from "../utils/permissions";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";
import Table from "../components/common/Table";

const Reports = () => {
  const { permissions } = useAuth();
  console.log("permissions in reports page", permissions);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);

  // Mock reports data - replace with actual API call
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setReports([
        {
          id: 1,
          name: "User Activity Report",
          type: "Activity",
          generatedAt: "2024-01-15",
          status: "Ready",
          size: "2.4 MB",
        },
        {
          id: 2,
          name: "Permission Audit Report",
          type: "Audit",
          generatedAt: "2024-01-14",
          status: "Ready",
          size: "1.8 MB",
        },
        {
          id: 3,
          name: "Monthly Summary",
          type: "Summary",
          generatedAt: "2024-01-13",
          status: "Processing",
          size: "-",
        },
        {
          id: 4,
          name: "Role Distribution Report",
          type: "Distribution",
          generatedAt: "2024-01-12",
          status: "Ready",
          size: "956 KB",
        },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const handleDownload = (report) => {
    if (!can(permissions, "report.download")) {
      alert("You do not have permission to download reports");
      return;
    }
    // Simulate download
    alert(`Downloading ${report.name}...`);
    // In real app: window.open(`/api/reports/${report.id}/download`)
  };

  const handleGenerateReport = () => {
    alert("Report generation feature coming soon!");
  };

  if (!can(permissions, "report.view")) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Access Denied
          </h2>
          <p className="text-slate-600">
            You don't have permission to view reports.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Loading reports...</div>
      </div>
    );
  }

  const headers = [
    "Report Name",
    "Type",
    "Generated",
    "Status",
    "Size",
    "Actions",
  ];

  const renderRow = (report) => (
    <>
      <td className="px-3 sm:px-6 py-4">
        <div className="text-xs sm:text-sm font-medium text-slate-900">
          {report.name}
        </div>
      </td>
      <td className="px-3 sm:px-6 py-4">
        <Badge variant="info" className="text-xs">
          {report.type}
        </Badge>
      </td>
      <td className="px-3 sm:px-6 py-4">
        <div className="text-xs sm:text-sm text-slate-600">
          {report.generatedAt}
        </div>
      </td>
      <td className="px-3 sm:px-6 py-4">
        <Badge
          variant={report.status === "Ready" ? "success" : "warning"}
          className="text-xs"
        >
          {report.status}
        </Badge>
      </td>
      <td className="px-3 sm:px-6 py-4">
        <div className="text-xs sm:text-sm text-slate-600">{report.size}</div>
      </td>
      <td className="px-3 sm:px-6 py-4 text-sm">
        {report.status === "Ready" && can(permissions, "report.download") && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDownload(report)}
            className="text-xs sm:text-sm"
          >
            Download
          </Button>
        )}
      </td>
    </>
  );

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Reports
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-1">
            View and download system reports
          </p>
        </div>
        <Button
          variant="primary"
          onClick={handleGenerateReport}
          className="w-full sm:w-auto"
        >
          Generate Report
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">
                Total Reports
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-2">
                {reports.length}
              </p>
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Ready</p>
              <p className="text-2xl font-bold text-slate-900 mt-2">
                {reports.filter((r) => r.status === "Ready").length}
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Processing</p>
              <p className="text-2xl font-bold text-slate-900 mt-2">
                {reports.filter((r) => r.status === "Processing").length}
              </p>
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
              <p className="text-sm font-medium text-slate-600">Total Size</p>
              <p className="text-2xl font-bold text-slate-900 mt-2">5.2 MB</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <Table
          headers={headers}
          data={reports}
          renderRow={renderRow}
          emptyMessage="No reports available"
        />
      </div>

      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-2">User Activity</h3>
          <p className="text-sm text-slate-600 mb-4">
            Generate a report of all user activities and login sessions
          </p>
          <Button variant="outline" size="sm" onClick={handleGenerateReport}>
            Generate
          </Button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-2">
            Permission Audit
          </h3>
          <p className="text-sm text-slate-600 mb-4">
            Audit all user permissions and role assignments
          </p>
          <Button variant="outline" size="sm" onClick={handleGenerateReport}>
            Generate
          </Button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-2">Monthly Summary</h3>
          <p className="text-sm text-slate-600 mb-4">
            Get a summary of all activities for the current month
          </p>
          <Button variant="outline" size="sm" onClick={handleGenerateReport}>
            Generate
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Reports;
