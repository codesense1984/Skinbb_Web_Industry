import { StatusBadge } from "@/core/components/ui/badge";
import { Button } from "@/core/components/ui/button";
import { DataTable } from "@/core/components/table/data-table";
import type { SurveyUser } from "@/core/types/user.type";
import { formatDate } from "@/core/utils";
import { EyeIcon } from "@heroicons/react/24/outline";
import type { ColumnDef } from "@tanstack/react-table";

const rows: SurveyUser[] = [
  {
    id: 20,
    name: "John Doe",
    email: "john@example.com",
    metroLocation: "Metro Cities",
    age: 26,
    gender: "Male",
    skinType: "Oily",
    city: "Mumbai",
    appliedDate: "05-May-2025",
    timeTaken: "2 min",
    status: "responded",
    surveysParticipated: 4,
    totalOrders: 3,
    orderValue: 1500,
    surveyRewards: 50,
  },
  {
    id: 19,
    name: "Jane Smith",
    email: "jane@example.com",
    metroLocation: "Metro Cities",
    age: 32,
    gender: "Female",
    skinType: "Normal",
    city: "Delhi",
    appliedDate: "04-May-2025",
    timeTaken: "2.5 min",
    status: "responded",
    surveysParticipated: 2,
    totalOrders: 1,
    orderValue: 500,
    surveyRewards: 50,
  },
  {
    id: 18,
    name: "Rahul Mehra",
    email: "rahul@example.com",
    metroLocation: "Metro Cities",
    age: 28,
    gender: "Male",
    skinType: "Dry",
    city: "Bangalore",
    appliedDate: "03-May-2025",
    timeTaken: "2.1 min",
    status: "responded",
    surveysParticipated: 3,
    totalOrders: 2,
    orderValue: 1000,
    surveyRewards: 10,
  },
  {
    id: 17,
    name: "Priya Verma",
    email: "priya@example.com",
    metroLocation: "Metro Cities",
    age: 30,
    gender: "Female",
    skinType: "Combination",
    city: "Hyderabad",
    appliedDate: "02-May-2025",
    timeTaken: "3 min",
    status: "opened",
    surveysParticipated: 6,
    totalOrders: 4,
    orderValue: 2000,
    surveyRewards: 50,
  },
  {
    id: 16,
    name: "Aman Singh",
    email: "aman@example.com",
    metroLocation: "Metro Cities",
    age: 27,
    gender: "Male",
    skinType: "Oily",
    city: "Pune",
    appliedDate: "01-May-2025",
    timeTaken: "1.8 min",
    status: "responded",
    surveysParticipated: 5,
    totalOrders: 2,
    orderValue: 1200,
    surveyRewards: 50,
  },
];

const columns: ColumnDef<SurveyUser>[] = [
  { accessorKey: "id", header: "#" },
  { accessorKey: "name", header: "Name" },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "metroLocation", header: "Location" },
  { accessorKey: "age", header: "Age" },
  { accessorKey: "gender", header: "Gender" },
  { accessorKey: "skinType", header: "Skin type" },
  { accessorKey: "city", header: "Location" },
  {
    accessorKey: "appliedDate",
    header: "Applied Date",
    cell: ({ row }) => formatDate(row.original.appliedDate),
  },
  { accessorKey: "timeTaken", header: "Time" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <StatusBadge module="survey_user" status={row.original.status} />
    ),
  },
  { accessorKey: "surveysParticipated", header: "Surveys Participated" },
  { accessorKey: "totalOrders", header: "Total Order" },
  { accessorKey: "orderValue", header: "Order Value" },
  { accessorKey: "surveyRewards", header: "Survey Rewards (₹)" },
  {
    header: "Actions",
    id: "actions",
    cell: () => (
      <Button variant="ghost" size="icon">
        <span className="sr-only">Open User Details</span>
        <EyeIcon />
      </Button>
    ),
  },
];

const SurveyUsers = () => {
  return (
    <div>
      <DataTable
        rows={rows}
        columns={columns}
        tableHeading="Participated User"
      />
    </div>
  );
};

export default SurveyUsers;
