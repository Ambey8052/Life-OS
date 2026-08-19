import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Opportunities from "./pages/Opportunities";
import Applications from "./pages/Applications";
import Tasks from "./pages/Tasks";
import Notes from "./pages/Notes";
import Analytics from "./pages/Analytics";
import CareerIntelligence from "./pages/CareerIntelligence";
import AIAssistant from "./pages/AIAssistant";
import AccountsVault from "./pages/AccountsVault";
import Documents from "./pages/Documents";
import Calendar from "./pages/Calendar";
import Reminders from "./pages/Reminders";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/opportunities" element={<Opportunities />} />
        <Route path="/applications" element={<Applications />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/career-intelligence" element={<CareerIntelligence />} />
        <Route path="/ai-assistant" element={<AIAssistant />} />
        <Route path="/accounts" element={<AccountsVault />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/reminders" element={<Reminders />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
