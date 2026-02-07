import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Building2, CheckCircle2, Clock, XCircle } from "lucide-react";

export default async function EstablishmentsPage() {
  const session = await auth();

  if (session?.user?.role !== "ADMIN") {
    return redirect("/");
  }

  // SAFETY CHECK: If prisma failed to connect, show error instead of crashing
  if (!prisma) {
    return <div>Database connection failed.</div>;
  }

  const establishments = await prisma.hotelProfile.findMany({
    include: {
      user: {
        select: {
          email: true,
          createdAt: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

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
                Hotel Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                UEN / Reg No.
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact Email
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
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <Building2 size={20} className="text-gray-500" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {est.hotelName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {est.location}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {est.uen}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {est.user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {est.verificationStatus === "VERIFIED" ? (
                    <span className="px-2 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      <CheckCircle2 size={12} /> Verified
                    </span>
                  ) : est.verificationStatus === "DECLINED" ? (
                    <span className="px-2 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                      <XCircle size={12} /> Declined
                    </span>
                  ) : (
                    <span className="px-2 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      <Clock size={12} /> Pending
                    </span>
                  )}
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