import React from "react";

const images = [
  {
    alt: "Graduates",
    url: "https://res.cloudinary.com/dz0hl3qmz/image/upload/f_auto,q_auto/v1772168612/black-hat-university-graduates-is-placed-green-leaves_1_1_s21ar8.jpg"
  },
  {
    alt: "Friends planning trip",
    url: "https://res.cloudinary.com/dz0hl3qmz/image/upload/f_auto,q_auto/v1772168636/group-friends-planning-trip-cafe_1_1_mhfa7k.jpg"
  },
  {
    alt: "Hero",
    url: "https://res.cloudinary.com/dz0hl3qmz/image/upload/f_auto,q_auto/v1772168631/hero_1_1_fcoggi.jpg"
  },
  {
    alt: "Hero Image",
    url: "https://res.cloudinary.com/dz0hl3qmz/image/upload/f_auto,q_auto/v1772168606/heroimage_1_1_ono2xx.jpg"
  },
  {
    alt: "Leisure activity women",
    url: "https://res.cloudinary.com/dz0hl3qmz/image/upload/f_auto,q_auto/v1772168630/leisure-activity-women-cute-grass-technology_1_1_czh3sn.jpg"
  },
  {
    alt: "Male scientist",
    url: "https://res.cloudinary.com/dz0hl3qmz/image/upload/f_auto,q_auto/v1772168632/male-scientist-carefully-studies-his-data_2_1_kbdyzc.jpg"
  },
  {
    alt: "Graduation gown rear view",
    url: "https://res.cloudinary.com/dz0hl3qmz/image/upload/f_auto,q_auto/v1772168629/rear-view-man-graduation-gown-standing-against-sky_1_1_lkwabp.jpg"
  }
];

const CloudinaryGallery = () => (
  <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", justifyContent: "center" }}>
    {images.map((img, idx) => (
      <img
        key={idx}
        src={img.url}
        alt={img.alt}
        style={{ maxWidth: "300px", width: "100%", borderRadius: "8px", boxShadow: "0 2px 8px #0002" }}
        loading="lazy"
      />
    ))}
  </div>
);

export default CloudinaryGallery;
