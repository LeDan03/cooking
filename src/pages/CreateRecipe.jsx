import { useState, useEffect, useMemo } from "react";
import { PlusIcon, TrashIcon, Loader2 } from "lucide-react";
import Select from "react-select";
import unitsResponse from "../api/unit/getAllUnit";
import { uploadImageToCloudinary } from "../services/cloudinary";
import createRecipeResponse from "../api/recipe/recipe/createRecipe";
import useAuthStore from "../store/useAuthStore";
import { useNavigate, useLocation } from "react-router-dom";
import path from "../utils/path";
import useCommonStore from "../store/useCommonStore";
import CustomButton from "../component/CustomButton";

import updateResponse from "../api/recipe/recipe/updateRecipe";
import { HttpStatusCode } from "axios";
import { toast } from "react-toastify";

const CreateRecipe = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const currentUser = useAuthStore((state) => state.currentUser)
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [images, setImages] = useState([]);
    const [imagesUrl, setImagesUrl] = useState([]);
    const [categories, setCategories] = useState([]);
    const [units, setUnits] = useState([]);
    const [categoryId, setCategoryId] = useState("");
    const [difficultyId, setDifficultyId] = useState("");
    const [unitId, setUnitId] = useState(1);
    const [prepTime, setPrepTime] = useState(1);
    const [cookingTime, setCookingTime] = useState(5);
    const [servings, setServings] = useState(1);
    const [steps, setSteps] = useState([
        { stt: 1, content: "", imageUrl: null, imagePublicId: null, file: null }
    ]);

    // Loading states
    const [isLoading, setIsLoading] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [loadingMessage, setLoadingMessage] = useState("");
    const [featured, setFeatured] = useState(false);

    const difficulties = useCommonStore((state) => state.difficulties);

    // update
    const [isUpdate, setIsUpdate] = useState(false);
    const [recipeUpdateData, setRecipeUpdateData] = useState(null);
    const [updateData, setUpdateData] = useState({ title: '', content: '', categoryId: 0, images: [], steps: [] });
    const [hasChange, setHasChange] = useState(false);
    const [existingImages, setExistingImages] = useState([]);
    const [existingSteps, setExistingSteps] = useState([]);


    const loadUpdateRecipeData = () => {
        const requiredUpdateRecipe = location.state?.updateRecipe;
        if (requiredUpdateRecipe) {
            setIsUpdate(true);
            setRecipeUpdateData(requiredUpdateRecipe);
        }
    }

    const loadCategories = () => {
        const categoriesInCache = useCommonStore.getState().categories;
        if (categoriesInCache.length > 0) {
            setCategories(categoriesInCache);
        }
    }

    const handleUpdateRecipe = async () => {
        try {
            setIsLoading(true);
            setLoadingMessage("Đang tải ảnh lên...");
            setLoadingProgress(30);

            const { recipeImageDtos, stepImageDtos } = await uploadImages();

            setLoadingProgress(60);
            setLoadingMessage("Đang xử lý dữ liệu...");

            // Giữ tất cả ảnh hợp lệ (cũ + mới)
            const finalImages = [
                ...existingImages.filter(i => i?.secureUrl && i?.publicId).map(i => ({ secureUrl: i.secureUrl, publicId: i.publicId })),
                ...recipeImageDtos
            ];

            // Gán ảnh cho từng step
            const finalSteps = steps.map((step) => {
                const existingStep = existingSteps.find(s => s.stt === step.stt);
                const uploadedStep = stepImageDtos.find(s => s.index === step.stt);
                return {
                    ...step,
                    imageUrl: uploadedStep?.secureUrl || existingStep?.imageUrl || null,
                    imagePublicId: uploadedStep?.publicId || existingStep?.publicId || null
                };
            });

            const payload = {
                categoryId: categoryId,
                title: title,
                content: content,
                images: finalImages,
                steps: finalSteps
            };
            console.log(JSON.stringify(payload, null, 2));

            // Gọi API update
            const result = await updateResponse(recipeUpdateData.id, payload);
            console.log("Kết quả update", result);
            if (result && result.data.status === HttpStatusCode.Ok) {
                setImages([]);
                setImagesUrl([]);
                setSteps([]);
                setUpdateData({ title: null, content: null, categoryId: null, images: [], steps: [] });
                setHasChange(false);
                setExistingImages([]);
                setExistingSteps([]);
                toast.success("Cập nhật thành công!");
                navigate(path.PERSONAL);
            } else if (result === false) {
                alert("Update false");
            }
        } catch (error) {
            console.error(error);
            toast.error("Cập nhật thất bại!");
        } finally {
            setIsLoading(false);
        }
    };


    const handleLoadUnits = async () => {
        const result = await unitsResponse();
        if (result !== null && result.length > 0) {
            setUnits(result);
        }
    }

    const [ingredients, setIngredients] = useState([
        { name: "", amount: "", unitId: "" },
    ]);

    // Cleanup URL objects to prevent memory leaks
    useEffect(() => {
        return () => {
            imagesUrl.forEach(url => URL.revokeObjectURL(url));
            steps.forEach(step => step.imageUrl && URL.revokeObjectURL(step.imageUrl));
        };
    }, [imagesUrl, steps]);

    const handleAddStep = () => {
        if (steps.length >= 50 || isLoading) return;
        setSteps([...steps, { stt: steps.length + 1, content: "", imageUrl: null }]);
    };

    const handleStepChange = (index, field, value) => {
        if (isLoading) return;
        // if (value === '') {
        //     alert("Vui lòng nhập đủ thông tin");
        //     return;
        // }
        const updated = [...steps];
        updated[index][field] = value;
        setSteps(updated);
    };

    const handleRemoveStep = (index) => {
        if (isLoading) return;
        const updated = steps.filter((_, i) => i !== index);
        updated.forEach((s, i) => (s.stt = i + 1));
        setSteps(updated);
    };

    const handleAddIngredient = () => {
        if (isLoading) return;
        setIngredients([...ingredients, { name: "", amount: "", unitId: "" }]);
    };

    const handleIngredientChange = (index, field, value) => {
        if (isLoading) return;
        // if (value === '') {
        //     alert("Vui lòng nhập giá trị");
        //     return;
        // }
        const updated = [...ingredients];
        updated[index][field] = value;
        setIngredients(updated);
    };

    const handleRemoveIngredient = (index) => {
        if (isLoading) return;
        const updated = ingredients.filter((_, i) => i !== index);
        setIngredients(updated);
    };

    const handleImageUpload = (e) => {
        if (isLoading) return;
        const files = Array.from(e.target.files);
        const previews = files.map(file => URL.createObjectURL(file));

        setImages(prev => [...prev, ...files]); // ảnh mới để upload
        setImagesUrl(prev => [...prev, ...previews]); // preview thêm
    };

    const handleStepImageUpload = (index, e) => {
        if (isLoading) return;
        const file = e.target.files[0];
        if (file) {
            const preview = URL.createObjectURL(file);

            setSteps(prevSteps => {
                const updated = [...prevSteps];
                const oldUrl = updated[index].imageUrl;
                if (oldUrl && oldUrl.startsWith('blob:') && oldUrl !== preview) {
                    URL.revokeObjectURL(oldUrl);
                }
                updated[index] = {
                    ...updated[index],
                    imageUrl: preview,
                    file: file,
                };
                return updated;
            });
        }
    };

    const handleRemoveImage = (index) => {
        if (isLoading) return;
        const urlToRemove = imagesUrl[index];

        // Xóa khỏi imagesUrl
        const updatedUrls = [...imagesUrl];
        updatedUrls.splice(index, 1);
        setImagesUrl(updatedUrls);

        // Nếu là ảnh mới => remove khỏi `images`
        const isNewImage = images.some(file => URL.createObjectURL(file) === urlToRemove);
        if (isNewImage) {
            const updatedNewImages = [...images].filter(file => URL.createObjectURL(file) !== urlToRemove);
            setImages(updatedNewImages);
        } else {
            // Nếu là ảnh cũ => remove khỏi `existingImages`
            setExistingImages(prev => prev.filter(img => img.secureUrl !== urlToRemove));
        }

        URL.revokeObjectURL(urlToRemove);
    };

    const handleRemoveStepImage = (index) => {
        if (isLoading) return;
        const updated = [...steps];
        const imageUrl = updated[index].imageUrl;
        if (imageUrl?.startsWith('blob:')) {
            URL.revokeObjectURL(imageUrl);
        }
        updated[index].imageUrl = null;
        updated[index].file = null;
        setSteps(updated);
    };

    useEffect(() => {
        if (isUpdate && recipeUpdateData) {
            console.log("RECIPE UPDATE", recipeUpdateData);
            setTitle(recipeUpdateData.title);
            setContent(recipeUpdateData.content);
            setCategoryId(categories.find(c => c.name === recipeUpdateData.categoryName)?.id);
            setDifficultyId(recipeUpdateData.difficultyId);
            setPrepTime(recipeUpdateData.prepTime);
            setCookingTime(recipeUpdateData.cookingTime);
            setServings(recipeUpdateData.servings);
            setImagesUrl(recipeUpdateData.imagesUrl);
            setIngredients(recipeUpdateData.ingredients);
            setSteps(recipeUpdateData.steps);
            setExistingImages(recipeUpdateData.imagesUrl);
            setExistingSteps(recipeUpdateData.steps || []);
        }
    }, [isUpdate, recipeUpdateData]);

    useEffect(() => {
        if (!currentUser) {
            navigate(path.LOGIN);
        }
        loadCategories();
        handleLoadUnits();
    }, []);

    useEffect(() => {
        loadUpdateRecipeData();
    }, [location.key]);

    const categoryOptions = useMemo(() => {
        return categories.map(c => ({
            value: c.id,
            label: c.name
        }))
    }, [categories]);

    const difficultyOptions = useMemo(() => {
        return difficulties.map(d => ({
            value: d.id,
            label: d.name
        }))
    }, [difficulties]);

    const unitOptions = useMemo(() => {
        return units.map(u => ({
            value: u.id,
            label: u.name
        }))
    }, [units]);
    const uploadImages = async () => {
        const uploadedRecipeImages = await Promise.all(
            images.map(file => uploadImageToCloudinary(file))
        );

        const uploadedStepImages = await Promise.all(
            steps.map(async (step, idx) => {
                if (!step.file) return null; // Chỉ upload nếu có file mới
                const uploaded = await uploadImageToCloudinary(step.file);
                return { index: step.stt, ...uploaded };
            })
        );

        return {
            recipeImageDtos: uploadedRecipeImages,
            stepImageDtos: uploadedStepImages.filter(Boolean)
        };
    };

    const handleSubmit = async (e, isPublic) => {
        e.preventDefault();
        if (isLoading) return;
        if (title.trim() === '' || content.trim() === '' || categoryId === "" || difficultyId === "" || ingredients.length <= 0) {
            alert("Xin hãy nhập đủ thông tin");
            return;
        }
        try {
            setIsLoading(true);
            setLoadingProgress(10);
            setLoadingMessage("Đang chuẩn bị...");

            const { 'recipeImageDtos': recipeImageDtos, 'stepImageDtos': stepImageDtos } = await uploadImages();

            setLoadingMessage("Đang xử lý dữ liệu...");
            setLoadingProgress(80);

            const updatedSteps = steps.map((step, idx) => {
                const stepDto = stepImageDtos.shift();
                if (step.file) {
                    return { ...step, imageUrl: stepDto.secureUrl, imagePublicId: stepDto.publicId, file: undefined };
                }
                return step;
            });

            const accountId = useAuthStore.getState().currentUser.id;
            const recipeData = {
                title,
                content,
                accountId,
                imageDtos: recipeImageDtos,
                categoryId,
                difficultyId,
                prepTime,
                cookingTime,
                servings,
                requirePublic: isPublic,
                ingredients,
                steps: updatedSteps,
                requireFeatured: featured
            };

            setLoadingMessage("Đang tạo công thức...");
            setLoadingProgress(90);

            const result = await createRecipeResponse(recipeData);
            if (result) {
                setLoadingMessage("Hoàn thành!");
                setLoadingProgress(100);
                setTimeout(() => {
                    navigate(path.PERSONAL);
                }, 500);
            }
        } catch (error) {
            setIsLoading(false);
            setLoadingProgress(0);
            setLoadingMessage("");
            alert('ERROR: có lỗi khi tạo recipe');
        }
    }

    // Loading Overlay Component
    const LoadingOverlay = () => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-2xl max-w-md w-full mx-4">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-orange-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        Đang tạo công thức...
                    </h3>
                    <p className="text-gray-600 mb-4">{loadingMessage}</p>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div
                            className="bg-orange-500 h-2 rounded-full transition-all duration-300 ease-out"
                            style={{ width: `${loadingProgress}%` }}
                        ></div>
                    </div>
                    <p className="text-sm text-gray-500">{Math.round(loadingProgress)}%</p>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {isLoading && <LoadingOverlay />}
            <div className={isLoading ? "pointer-events-none opacity-50" : ""}>
                <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 bg-gray-100">
                    <h1 className="text-2xl font-bold text-center text-orange-600">
                        {!isUpdate ? "TẠO CÔNG THỨC RIÊNG" : "CHỈNH SỬA CÔNG THỨC"}
                    </h1>

                    {/* Title */}
                    <div>
                        <label className="font-medium text-gray-700">Tên món ăn</label>
                        <input
                            className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-orange-400"
                            value={title}
                            onChange={(e) => {
                                setTitle(e.target.value);
                                setHasChange(true);
                            }}
                            placeholder="Hãy chọn một cái tên cho món ăn..."
                            required
                            disabled={isLoading}
                        />
                    </div>

                    {/* Content */}
                    <div>
                        <label className="font-medium text-gray-700">Mô tả / Giới thiệu</label>
                        <textarea
                            className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-orange-400"
                            rows={3}
                            value={content}
                            onChange={(e) => {
                                setContent(e.target.value);
                                setHasChange(true);
                            }}
                            placeholder="Mô tả một tí về món ăn nhé..."
                            required
                            disabled={isLoading}
                        />
                    </div>

                    {/* Images */}
                    <div>
                        <label className="font-medium text-gray-700">Ảnh món ăn</label>
                        <div className="mt-2">
                            <label className={`inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-md cursor-pointer hover:bg-orange-600 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={(e) => { handleImageUpload(e); setHasChange(true) }}
                                    className="hidden"
                                    disabled={isLoading}
                                />
                                Chọn ảnh
                            </label>
                        </div>
                        <div className="flex flex-wrap gap-3 mt-2">
                            {imagesUrl.length === 0 && (
                                <p className="text-gray-500">Chưa có ảnh nào được chọn</p>
                            )}
                            {imagesUrl.map((url, idx) => (
                                <div key={idx} className="relative">
                                    <img src={url} alt={`img-${idx}`} className="w-24 h-24 rounded object-cover" />
                                    <div
                                        className={`flex items-center justify-center w-5 h-5 bg-white cursor-pointer absolute top-0 right-0 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <TrashIcon
                                            className="text-red-500 w-4 h-4"
                                            onClick={() => handleRemoveImage(idx)}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Category & Difficulty */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="font-medium text-gray-700">Phân loại món ăn</label>
                            <Select
                                required
                                className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-orange-400"
                                options={categoryOptions}
                                value={categoryOptions.find(opt => opt.value === categoryId)}
                                onChange={(selected) => setCategoryId(selected?.value)}
                                isDisabled={isLoading}
                                styles={{
                                    menuList: (base) => ({
                                        ...base,
                                        maxHeight: 200,
                                        overflowY: 'auto',
                                    }),
                                }}
                            />
                        </div>
                        <div>
                            <label className="font-medium text-gray-700">Độ khó</label>
                            <Select
                                required
                                className={`w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-400 ${isUpdate ? 'bg-gray-300' : 'bg-white'}`}
                                options={difficultyOptions}
                                value={difficultyOptions.find(opt => opt.value === difficultyId)}
                                onChange={(selected) => setDifficultyId(selected?.value)}
                                isDisabled={isLoading || isUpdate}
                                styles={{
                                    menuList: (base) => ({
                                        ...base,
                                        maxHeight: 200,
                                        overflowY: 'auto',
                                    }),
                                }}
                            />
                        </div>
                    </div>

                    {/* Prep & Cook Time, Servings */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="font-medium text-gray-700">Sơ chế (phút)</label>
                            <input
                                type="number"
                                className={`w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-orange-400 ${isUpdate ? 'bg-gray-300' : 'bg-white'}`}
                                value={prepTime}
                                onChange={(e) => setPrepTime(Number(e.target.value))}
                                disabled={isLoading || isUpdate}
                            />
                        </div>
                        <div>
                            <label className="font-medium text-gray-700">Nấu (phút)</label>
                            <input
                                type="number"
                                className={`w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-400 ${isUpdate ? 'bg-gray-300' : 'bg-white'}`}
                                value={cookingTime}
                                min={5}
                                onChange={(e) => setCookingTime(Number(e.target.value))}
                                disabled={isLoading || isUpdate}
                            />
                        </div>
                        <div>
                            <label className="font-medium text-gray-700">Khẩu phần (người)</label>
                            <input
                                type="number"
                                className={`w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-400 ${isUpdate ? 'bg-gray-300' : 'bg-white'}`}
                                value={servings}
                                onChange={(e) => setServings(Number(e.target.value))}
                                disabled={isLoading || isUpdate}
                            />
                        </div>
                    </div>

                    {/* Ingredients */}
                    <div>
                        <label className="font-medium text-gray-700">Nguyên liệu</label>
                        <div className="space-y-3 mt-2">
                            {ingredients.map((ing, idx) => (
                                <div key={idx} className="flex flex-col sm:flex-row gap-2 items-center">
                                    <input
                                        placeholder="Tên nguyên liệu"
                                        value={ing.name}
                                        onChange={(e) => handleIngredientChange(idx, "name", e.target.value)}
                                        className={`flex-1 p-2 border border-gray-300 rounded-md  focus:ring-2 focus:ring-orange-400 ${isUpdate ? 'bg-gray-300' : 'bg-white'}`}
                                        required
                                        disabled={isLoading || isUpdate}
                                    />
                                    <input
                                        placeholder="Số lượng"
                                        value={ing.amount}
                                        type="number"
                                        min={1}
                                        required
                                        onChange={(e) => handleIngredientChange(idx, "amount", e.target.value)}
                                        className={`w-24 p-2 border border-gray-300 rounded-md  focus:ring-2 focus:ring-orange-400 ${isUpdate ? 'bg-gray-300' : 'bg-white'}`}
                                        disabled={isLoading || isUpdate}
                                    />
                                    <Select
                                        required
                                        options={unitOptions}
                                        value={unitOptions.find(opt => opt.value === Number(ing.unitId))}
                                        onChange={(e) => { handleIngredientChange(idx, "unitId", e.value) }}
                                        className={`w-28 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-400 ${isUpdate ? 'bg-gray-300' : 'bg-white'}`}
                                        isDisabled={isLoading || isUpdate}
                                        styles={{
                                            menuList: (base) => ({
                                                ...base,
                                                maxHeight: 200,
                                                overflow: 'auto'
                                            })
                                        }}
                                    />
                                    {idx > 0 && (
                                        <TrashIcon
                                            className={`w-5 h-5 text-red-500 cursor-pointer ${isLoading || isUpdate ? 'opacity-60 cursor-not-allowed' : ''}`}
                                            onClick={() => handleRemoveIngredient(idx)}
                                        />
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={handleAddIngredient}
                                className={`flex items-center text-green-600 gap-1 hover:text-green-700 ${isLoading || isUpdate ? 'opacity-60 cursor-not-allowed' : ''}`}
                                disabled={isLoading || isUpdate}

                            >
                                <PlusIcon className="w-4 h-4" />
                                Thêm nguyên liệu
                            </button>
                        </div>
                    </div>

                    {/* Steps */}
                    <div>
                        <label className="font-medium text-gray-700">Các bước thực hiện</label>
                        <div className="space-y-4 mt-2">
                            {steps.map((step, idx) => (
                                <div key={idx} className="border border-gray-300 p-3 rounded-md space-y-2 bg-white">
                                    <div className="flex justify-between items-center">
                                        <p className="font-semibold text-gray-700">Bước {step.stt}</p>
                                        {steps.length > 1 && (
                                            <TrashIcon
                                                className={`w-5 h-5 text-red-400 cursor-pointer hover:text-red-500 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                onClick={() => handleRemoveStep(idx)}
                                            />
                                        )}
                                    </div>
                                    <textarea
                                        rows={2}
                                        className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-orange-400"
                                        placeholder="Nội dung bước"
                                        value={step.content}
                                        onChange={(e) => handleStepChange(idx, "content", e.target.value)}
                                        required
                                        disabled={isLoading}
                                    />
                                    <div>
                                        <label className={`inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-md cursor-pointer hover:bg-orange-600 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    handleStepImageUpload(idx, e);
                                                    setHasChange(true);
                                                }}
                                                className="hidden"
                                                disabled={isLoading}
                                            />
                                            Chọn ảnh cho bước
                                        </label>
                                        {step.imageUrl ? (
                                            <div className="relative">
                                                <img
                                                    src={step.imageUrl}
                                                    alt={`step-${idx}`}
                                                    className="w-32 h-24 object-cover rounded mt-2"
                                                />
                                                <TrashIcon
                                                    className={`absolute top-0 right-0 w-5 h-5 text-red-500 cursor-pointer ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    onClick={() => handleRemoveStepImage(idx)}
                                                />
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 mt-2">Chưa có ảnh cho bước này</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {steps.length < 50 && (
                                <button
                                    type="button"
                                    onClick={handleAddStep}
                                    className={`flex items-center text-green-600 gap-1 hover:text-green-700 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    disabled={isLoading}
                                >
                                    <PlusIcon className="w-4 h-4" />
                                    Thêm bước
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Submit Buttons */}
                    {!isUpdate ? (
                        <div className="flex items-center gap-4">
                            <button
                                type="button"
                                onClick={(e) => handleSubmit(e, true)}
                                disabled={isLoading}
                                className={`px-4 py-2 ml-auto rounded-md font-semibold text-white bg-green-600 hover:bg-green-700 flex items-center gap-2 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                                Lên sóng
                            </button>
                            <button
                                type="button"
                                onClick={(e) => handleSubmit(e, false)}
                                disabled={isLoading}
                                className={`px-4 py-2 rounded-md font-semibold text-white bg-gray-500 hover:bg-gray-600 flex items-center gap-2 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                                Lưu trữ
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center">
                            <CustomButton
                                classname="bg-orange-600 text-white w-3/4 h-10"
                                onClick={() => { handleUpdateRecipe() }}
                                content="Cập nhật"
                            />
                        </div>
                    )}

                </div>
            </div>
        </>
    );
};

export default CreateRecipe;