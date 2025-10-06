// import { PageContent } from "@/core/components/ui/structure";

// // // Create fetcher for server-side data
// // const fetcher = () =>
// //   createSimpleFetcher(apiGetSellerMembers, {
// //     dataPath: "data.items",
// //     totalPath: "data.total",
// //     filterMapping: {
// //       query: "query",
// //     },
// //   });

// const UserList = () => {
//   // const [stats, setStats] = useState(statsData);
//   // const navigate = useNavigate();

//   // // Fetch stats separately since we need them for the summary cards
//   // const fetchStats = useCallback(async () => {
//   //   try {
//   //     console.log("Fetching user stats...");
//   //     const response = await apiGetSellerMembers({ page: 1, limit: 1000 }); // Get all for stats
//   //     console.log("User stats response:", response);

//   //     if (response.success) {
//   //       const totalUsers = response.data.total;
//   //       const activeUsers = response.data.items.filter(user => user.active).length;
//   //       const inactiveUsers = response.data.items.filter(user => !user.active).length;

//   //       // Calculate new users this month
//   //       const currentMonth = new Date().getMonth();
//   //       const currentYear = new Date().getFullYear();
//   //       const newThisMonth = response.data.items.filter(user => {
//   //         const userDate = new Date(user.createdAt);
//   //         return userDate.getMonth() === currentMonth && userDate.getFullYear() === currentYear;
//   //       }).length;

//   //       setStats([
//   //         {
//   //           title: "Total Users",
//   //           value: totalUsers,
//   //           barColor: "bg-primary",
//   //           icon: true,
//   //         },
//   //         {
//   //           title: "Active Users",
//   //           value: activeUsers,
//   //           barColor: "bg-blue-300",
//   //           icon: false,
//   //         },
//   //         {
//   //           title: "Inactive Users",
//   //           value: inactiveUsers,
//   //           barColor: "bg-violet-300",
//   //           icon: false,
//   //         },
//   //         {
//   //           title: "New This Month",
//   //           value: newThisMonth,
//   //           barColor: "bg-red-300",
//   //           icon: true,
//   //         },
//   //       ]);
//   //     } else {
//   //       console.error("API response not successful:", response);
//   //     }
//   //   } catch (error) {
//   //     console.error("Failed to fetch user stats:", error);
//   //   }
//   // }, []);

//   // useEffect(() => {
//   //   fetchStats();
//   // }, [fetchStats]);

//   return (
//     <PageContent
//       header={{
//         title: "Users",
//         description: "Manage and view seller member information and analytics.",
//         // actions: (
//         //   <Button onClick={() => navigate(PANEL_ROUTES.USER.CREATE)}>
//         //     <PlusIcon className="mr-2 h-4 w-4" />
//         //     Add User
//         //   </Button>
//         // ),
//       }}
//     >
//       Users
//       {/* <section
//         className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-4"
//         aria-label="User Statistics"
//       >
//         {stats.map((item) => (
//           <StatCard
//             key={item.title}
//             title={item.title}
//             value={formatNumber(item.value)}
//             barColor={item.barColor}
//           />
//         ))}
//       </section> */}
//       {/* 
//       <DataTable
//         columns={columns}
//         isServerSide
//         fetcher={fetcher()}
//         queryKeyPrefix={PANEL_ROUTES.USER.LIST}
//       /> */}
//     </PageContent>
//   );
// };

// export default UserList;
