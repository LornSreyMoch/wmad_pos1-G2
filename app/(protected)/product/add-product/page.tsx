"use client";
import React, { useState, useEffect } from "react";
import PageWrapper from "@/components/page-wrapper";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface CategoryProduct {
    id: number;
    nameEn: string;
}

const AddProduct = () => {
    const [nameEn, setNameEn] = useState("");
    const [nameKh, setNameKh] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [sku, setSku] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const [categories, setCategories] = useState<CategoryProduct[]>([]);

    useEffect(() => {
        fetch("/api/category", { credentials: "same-origin" })
            .then((response) => response.json())
            .then((data) => setCategories(data.data))
            .catch((error) => {
                console.error("Error fetching categories:", error);
                toast({
                    title: "Error",
                    description: "Failed to fetch categories.",
                });
            });
    }, []);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImage(e.target.files[0]);
        }
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!nameEn) newErrors.nameEn = "English name is required";
        if (!nameKh) newErrors.nameKh = "Khmer name is required";
        if (!categoryId) newErrors.categoryId = "Category is required";
        if (!sku) newErrors.sku = "SKU is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!validate()) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);

        let imageUrl = "";

        if (image) {
            const formData = new FormData();
            formData.append("image", image);

            try {
                const uploadResponse = await fetch("/api/upload", {
                    method: "POST",
                    credentials: "same-origin",
                    body: formData,
                });
                const uploadData = await uploadResponse.json();
                imageUrl = uploadData.url ?? "";

                toast({
                    title: "Success",
                    description: "Image uploaded successfully.",
                });
            } catch (error) {
                console.error("Error uploading image:", error);
                toast({
                    title: "Error",
                    description: "Failed to upload image.",
                });
                setIsLoading(false);
                return;
            }
        }

        const productData = {
            nameEn,
            nameKh,
            categoryId,
            sku,
            image: imageUrl || null,
        };

        try {
            const response = await fetch("/api/product", {
                method: "POST",
                credentials: "same-origin",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(productData),
            });

            if (response.ok) {
                toast({
                    title: "Success",
                    description: "New product added successfully.",
                });
                setNameEn("");
                setNameKh("");
                setCategoryId("");
                setSku("");
                setImage(null);
            } else {
                const errorData = await response.json();
                toast({
                    title: "Error",
                    description: `Failed to add product: ${errorData.message}`,
                });
            }
            router.replace("/product")
        } catch (error) {
            console.error("Error adding product:", error);
            toast({
                title: "Error",
                description: "An unexpected error occurred.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <PageWrapper>
            <div className="bg-white p-6 rounded-xl shadow-md w-1/3">
                <h2 className="text-2xl font-bold text-sky-600 mb-6 text-center">
                    Add New Product
                </h2>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    {/* English Name */}
                    <div>
                        <label className="block text-gray-800 font-medium mb-1">English Name</label>
                        <input
                            type="text"
                            value={nameEn}
                            onChange={(e) => setNameEn(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                            placeholder="Enter English Name"
                        />
                        {errors.nameEn && <p className="text-red-500 text-sm">{errors.nameEn}</p>}
                    </div>

                    {/* Khmer Name */}
                    <div>
                        <label className="block text-gray-800 font-medium mb-1">Khmer Name</label>
                        <input
                            type="text"
                            value={nameKh}
                            onChange={(e) => setNameKh(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                            placeholder="បញ្ចូលឈ្មោះខ្មែរ"
                        />
                        {errors.nameKh && <p className="text-red-500 text-sm">{errors.nameKh}</p>}
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-gray-800 font-medium mb-1">Category</label>
                        <select
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                        >
                            <option value="">Select Category</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.nameEn}
                                </option>
                            ))}
                        </select>
                        {errors.categoryId && <p className="text-red-500 text-sm">{errors.categoryId}</p>}
                    </div>

                    {/* SKU */}
                    <div>
                        <label className="block text-gray-800 font-medium mb-1">SKU</label>
                        <input
                            type="text"
                            value={sku}
                            onChange={(e) => setSku(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                            placeholder="Enter SKU"
                        />
                        {errors.sku && <p className="text-red-500 text-sm">{errors.sku}</p>}
                    </div>

                    {/* Image */}
                    <div>
                        <label className="block text-gray-800 font-medium mb-1">Product Image (Optional)</label>
                        <input
                            type="file"
                            onChange={handleImageChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className={`w-full py-2 rounded-lg font-medium text-white ${isLoading ? "bg-gray-400" : "bg-sky-500 hover:bg-sky-600"
                            } transition duration-300`}
                        disabled={isLoading}
                    >
                        {isLoading ? "Adding Product..." : "Add Product"}
                    </button>
                </form>
            </div>
        </PageWrapper>
    );
};

export default AddProduct;
