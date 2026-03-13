import { useState } from "react";
import { motion } from "framer-motion";
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
