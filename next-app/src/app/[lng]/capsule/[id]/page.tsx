import { ICapsuleToy } from "@/lib/models/capsule-model";

const IMAGE_URI = process.env.IMAGE_SERVER_URL || "";
const API_URI = process.env.APP_SERVER_URL || "";

async function fetchData(id: string) {
  const response = await fetch(API_URI + "/api/capsules/" + id, {
    method: "GET",
  });
  const data = await response.json();
  return data;
}

export default async function Page({ params }: { params: { id: string } }) {
  const capsule: ICapsuleToy = await fetchData(params.id);

  return (
    <div>
      <h1>{capsule.name}</h1>
      <p>{capsule.description}</p>
      {capsule.img ? (
        <img src={IMAGE_URI + capsule.img} alt={capsule.name} />
      ) : (
        <img src={IMAGE_URI + "images/prepare.jpg"} alt={capsule.name} />
      )}
      {capsule.detail_img.length > 0
        ? capsule.detail_img.map((img: string) => (
            <img src={IMAGE_URI + img} alt={capsule.name} />
          ))
        : null}
    </div>
  );
}
