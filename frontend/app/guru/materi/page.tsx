"use client";

import { useEffect, useState } from "react";
import { MateriListPage } from "@/components/materi/MateriListPage";

export default function GuruMateriPage() {
  const [currentUserId, setCurrentUserId] = useState("");
  const [currentUserRole, setCurrentUserRole] = useState("");
  const [mapelOptions, setMapelOptions] = useState<string[]>([]);
  const [mapelLoaded, setMapelLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => {
      setCurrentUserId(d?.id ?? "");
      setCurrentUserRole(d?.role ?? "");
    }).catch(() => {});
    fetch("/api/mapel/saya").then((r) => r.json()).then((d) => {
      setMapelOptions(Array.isArray(d) ? d : []);
    }).catch(() => {}).finally(() => setMapelLoaded(true));
  }, []);

  // Selama mapel/saya belum selesai dimuat, jangan tampilkan tombol Tambah
  // dulu — mencegah kedip "boleh tambah" lalu langsung disembunyikan begitu
  // ternyata guru ini tidak diampu mapel apa pun.
  const canCreate = mapelLoaded && mapelOptions.length > 0;

  return (
    <MateriListPage
      roleBadge="Guru"
      currentUserId={currentUserId}
      currentUserRole={currentUserRole}
      mapelOptions={mapelOptions}
      canCreate={canCreate}
    />
  );
}
