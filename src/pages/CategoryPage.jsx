import React, { Suspense, lazy } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import NewsColumns from "../components/NewsColumns";

// Lazy load the KenyaUpdate component
const KenyaUpdate = lazy(() => import("../components/KenyaUpdate"));

export default function CategoryPage() {
  const { category } = useParams();

  // Capitalize the first letter of the category for the title
  const formattedCategory = category.charAt(0).toUpperCase() + category.slice(1);

  return (
    <>
      <Helmet>
        <title>{formattedCategory} News | Zawadi Intel News</title>
        <meta
          name="description"
          content={`Latest ${formattedCategory} news and updates from Zawadi Intel News.`}
        />
        <link
          rel="canonical"
          href={`https://zawadiintelnews.vercel.app/category/${category}`}
        />
      </Helmet>
      <main className="category-page">
        {/* Conditionally render KenyaUpdate for the 'local' category */}
        {category.toLowerCase() === "local" && (
          <Suspense fallback={<div className="loading">Loading Kenya Update...</div>}>
            <KenyaUpdate />
          </Suspense>
        )}
        <NewsColumns category={category} />
      </main>
    </>
  );
}
