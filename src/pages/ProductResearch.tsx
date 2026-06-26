import { useState } from "react";
import { motion } from "framer-motion";
import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductResearchHero from "@/components/product-research/ProductResearchHero";
import ProductResearchService from "@/components/product-research/ProductResearchService";
import ViralProductsTable from "@/components/product-research/ViralProductsTable";
import ProductCategories from "@/components/product-research/ProductCategories";
import ProductResearchCTA from "@/components/product-research/ProductResearchCTA";

const ProductResearch = () => {
  return (
    <>
      <SEO
        title="Product Research para TikTok Shop — TikShopTok"
        description="Detectamos los productos más virales de TikTok Shop por categoría: ranking, ventas, ingresos y viral score listos para tu marca."
        path="/product-research"
      />
      <Navbar />
      <ProductResearchHero />
      <ProductResearchService />
      <ProductCategories />
      <ViralProductsTable />
      <ProductResearchCTA />
      <Footer />
    </>
  );
};

export default ProductResearch;
