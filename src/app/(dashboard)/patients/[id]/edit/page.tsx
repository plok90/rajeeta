"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function PatientEditPage() {
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    router.replace(`/patients/${params.id}?edit=true`);
  }, [params.id, router]);

  return (
    <div className="flex justify-center items-center h-64">
      <p>Redirecting...</p>
    </div>
  );
}