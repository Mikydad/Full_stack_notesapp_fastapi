import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Users, DollarSign, Activity } from "lucide-react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { logout } from "../utils/logout";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
// import CategoryManager from "../components/CategoryManager";

const data = [
  { name: "Mon", value: 120 },
  { name: "Tue", value: 200 },
  { name: "Wed", value: 150 },
  { name: "Thu", value: 280 },
  { name: "Fri", value: 220 },
  { name: "Sat", value: 300 },
  { name: "Sun", value: 250 },
];

export default function Dashboard() {
  const { role, setToken } = useAuth(); // ✅ hook inside component
  const navigate = useNavigate();

  const deleteAllNotes = () => {
    console.log("Delete Clicked from admin");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {role === "admin" && (
        <button onClick={deleteAllNotes}>Delete All Notes</button>
      )}

      <Button onClick={() => logout(setToken, navigate)}>
        Logout
      </Button>

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <Button className="rounded-2xl">New Report</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Users", value: "12,340", icon: Users },
          { title: "Revenue", value: "$45,200", icon: DollarSign },
          { title: "Activity", value: "1,284", icon: Activity },
          { title: "Growth", value: "+12%", icon: ArrowUpRight },
        ].map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="rounded-2xl shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <stat.icon className="h-6 w-6 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="mt-8">
        {/* <CategoryManager /> */}
      </div>
    </div>
  );
}
