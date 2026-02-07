import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function EstablishmentsPage() {
  const session = await auth();
  
  // 1. Security Check
  if (session?.user?.role !== "ADMIN") {
    return redirect("/");
  }

  // 2. Fetch Data (Hotel Profiles)
  const establishments = await prisma.hotelProfile.findMany({
    include: {
      user: true, // Get the login email associated with this profile
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // 3. Render the Page
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Establishments</h1>
        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
          Total: {establishments.length}
        </span>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Company Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                UEN / Reg No.
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Verification
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {establishments.map((est) => (
              <tr key={est.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {est.companyName || "Unnamed"}
                  </div>
                  <div className="text-sm text-gray-500">
                    {est.address || "No address"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {est.uen || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div>{est.contactPerson || "No contact"}</div>
                  <div>{est.contactNumber}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      est.isVerified
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {est.isVerified ? "Verified" : "Unverified"}
                  </span>
                </td>
              </tr>
            ))}
            {establishments.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                  No establishments found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}