const CLOUD_NAME = "uwqsnkse";
const UPLOAD_PRESET = "regenel_diagnostic";

export async function uploadImage(file) {
  const body = new FormData();
  body.append("file", file);
  body.append("upload_preset", UPLOAD_PRESET);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: "POST", body });
  if (!response.ok) throw new Error(`Upload refusé (${response.status})`);
  const { public_id } = await response.json();
  return public_id;
}
