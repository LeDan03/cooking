import { useState, useEffect, useMemo } from "react";
import { PlusIcon, TrashIcon } from "lucide-react";
import Select from "react-select";
import unitsResponse from "../api/unit/getAllUnit";
import { uploadImageToCloudinary } from "../services/cloudinary";
import createRecipeResponse from "../api/recipe/createRecipe";
import useAuthStore from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";
import path from "../utils/path";
import useCommonStore from "../store/useCommonStore";

const CreateRecipe = () => {

    const navigate = useNavigate();
    const currentUser = useAuthStore((state)=>state.currentUser)
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [images, setImages] = useState([]);
    const [imagesUrl, setImagesUrl] = useState([]);
    const [categories, setCategories] = useState([]);
    // const [difficulties, setDifficulties] = useState([]);
    const [units, setUnits] = useState([]);
    const [categoryId, setCategoryId] = useState("");
    const [difficultyId, setDifficultyId] = useState("");
    const [unitId, setUnitId] = useState();
    const [prepTime, setPrepTime] = useState(0);
    const [cookingTime, setCookingTime] = useState(5);
    const [servings, setServings] = useState(1);
    const [steps, setSteps] = useState([
        { stt: 1, content: "", imageUrl: null, file: null },
        { stt: 2, content: "", imageUrl: null, file: null },
        { stt: 3, content: "", imageUrl: null, file: null },
    ]);
    const difficulties = useCommonStore((state)=>state.difficulties);
    const [recipeRequest, setRecipeRequest] = useState({});
    const loadCategories = () => {
        // const rawData = sessionStorage.getItem("categories");
        // if (rawData) {
        //     setCategories(JSON.parse(rawData));
        // }
        const categoriesInCache = useCommonStore.getState().categories;
        if(categoriesInCache.length>0){
            setCategories(categoriesInCache);
        }
    }
    // const loadDifficulties = () => {
    //     // const rawData = sessionStorage.getItem("difficulties");
    //     // if (rawData) {
    //     //     setDifficulties(JSON.parse(rawData));
    //     // }
    //     const diffsInCache= useCommonStore.getState().difficulties;
    //     if(diffsInCache.length>0){
    //         setDifficulties(diffsInCache);
    //     }
    // }
    const handleLoadUnits = async () => {
        const result = await unitsResponse();
        if (result !== null && result.length > 0) {
            setUnits(result);
        }
    }
    const [ingredients, setIngredients] = useState([
        { name: "", amount: "", unitId: "" },
    ]);
    const [requirePublic, setRequirePublic] = useState(true);
    // Cleanup URL objects to prevent memory leaks
    useEffect(() => {
        return () => {
            imagesUrl.forEach(url => URL.revokeObjectURL(url));
            steps.forEach(step => step.imageUrl && URL.revokeObjectURL(step.imageUrl));
        };
    }, [imagesUrl, steps]);
    const handleAddStep = () => {
        if (steps.length >= 50) return;
        setSteps([...steps, { stt: steps.length + 1, content: "", imageUrl: null }]);
    };
    const handleStepChange = (index, field, value) => {
        const updated = [...steps];
        updated[index][field] = value;
        setSteps(updated);
    };
    const handleRemoveStep = (index) => {
        const updated = steps.filter((_, i) => i !== index);
        updated.forEach((s, i) => (s.stt = i + 1));
        setSteps(updated);
    };
    const handleAddIngredient = () => {
        setIngredients([...ingredients, { name: "", amount: "", unitId: "" }]);
    };
    const handleIngredientChange = (index, field, value) => {
        const updated = [...ingredients];
        updated[index][field] = value;
        setIngredients(updated);
    };
    const handleRemoveIngredient = (index) => {
        const updated = ingredients.filter((_, i) => i !== index);
        setIngredients(updated);
    };
    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        const previews = files.map(file => URL.createObjectURL(file));
        setImages(prev => [...prev, ...files]);
        // setImagesUrl([...imagesUrl, ...previews]);
        setImagesUrl(prev => [...prev, ...previews]);
    };
    const handleStepImageUpload = (index, e) => {
        const file = e.target.files[0];
        if (file) {
            const preview = URL.createObjectURL(file);

            setSteps(prevSteps => {
                const updated = [...prevSteps];

                // ❗ Revoke blob ảnh cũ NẾU nó khác với ảnh mới
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
        const updated = [...imagesUrl];
        URL.revokeObjectURL(updated[index]);
        updated.splice(index, 1);
        setImagesUrl(updated);
    };
    const handleRemoveStepImage = (index) => {
        const updated = [...steps];

        const imageUrl = updated[index].imageUrl;
        if (imageUrl?.startsWith('blob:')) {
            URL.revokeObjectURL(imageUrl); // cleanup ảnh blob
        }
        updated[index].imageUrl = null;
        updated[index].file = null;
        setSteps(updated);
    };

    useEffect(() => {
        if (!currentUser) {
            navigate(path.LOGIN);
        }
        loadCategories();
        // loadDifficulties();
        handleLoadUnits();
    }, []);
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
        const recipePromises = images.map(file => uploadImageToCloudinary(file));
        const stepFiles = steps.map(step => step.file).filter(Boolean); // Bỏ null
        const stepPromises = stepFiles.map(file => uploadImageToCloudinary(file));

        const recipeImageUrls = await Promise.all(recipePromises);
        const stepImageUrls = await Promise.all(stepPromises);

        return { 'recipeImageUrls': recipeImageUrls, 'stepImageUrls': stepImageUrls };
    };

    const handleSubmit = async (e, isPublic) => {
        e.preventDefault();
        try {
            console.log('ingredients', ingredients);
            const { 'recipeImageUrls': recipeImageUrls, 'stepImageUrls': stepImageUrls } = await uploadImages();
            const updatedSteps = steps.map((step, idx) => {
                if (step.file) {
                    return { ...step, imageUrl: stepImageUrls.shift(), file: undefined };
                }
                return step;
            });
            const accountId = useAuthStore.getState().currentUser.id;
            const recipeData = {
                title,
                content,
                accountId,
                imagesUrl: recipeImageUrls,
                categoryId,
                difficultyId,
                prepTime,
                cookingTime,
                servings,
                requirePublic: isPublic,
                ingredients,
                steps: updatedSteps,
            };
            const result = await createRecipeResponse(recipeData);
            if (result) {
                navigate(path.PERSONAL);
            }
        } catch (error) {
            alert('ERROR: co loi khi tao recipe');
        }
    }
    return (
        <form>
            <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 bg-gray-100">
                <h1 className="text-2xl font-bold text-center text-orange-600">TẠO CÔNG THỨC RIÊNG</h1>
                {/* Title */}
                <div>
                    <label className="font-medium text-gray-700">Tên món ăn</label>
                    <input
                        className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-orange-400"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Hãy chọn một cái tên cho món ăn..."
                        required
                    />
                </div>
                {/* Content */}
                <div>
                    <label className="font-medium text-gray-700">Mô tả / Giới thiệu</label>
                    <textarea
                        className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-orange-400"
                        rows={3}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Mô tả một tí về món ăn nhé..."
                        required
                    />
                </div>
                {/* Images */}
                <div>
                    <label className="font-medium text-gray-700">Ảnh món ăn</label>
                    <div className="mt-2">
                        <label className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-md cursor-pointer hover:bg-orange-600">
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageUpload}
                                className="hidden"
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
                                <TrashIcon
                                    className="w-5 h-5 text-red-500 cursor-pointer absolute top-0 right-0"
                                    onClick={() => handleRemoveImage(idx)}
                                />
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
                            styles={{
                                menuList: (base) => ({
                                    ...base,
                                    maxHeight: 200, // khoảng 5 option, scroll nếu vượt quá
                                    overflowY: 'auto',
                                }),
                            }}
                        />
                    </div>
                    <div>
                        <label className="font-medium text-gray-700">Độ khó</label>
                        <Select
                            required
                            className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-orange-400"
                            options={difficultyOptions}
                            value={difficultyOptions.find(opt => opt.value === difficultyId)}
                            onChange={(selected) => setDifficultyId(selected?.value)}
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
                            className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-orange-400"
                            value={prepTime}
                            onChange={(e) => setPrepTime(Number(e.target.value))}

                        />
                    </div>
                    <div>
                        <label className="font-medium text-gray-700">Nấu (phút)</label>
                        <input
                            type="number"
                            className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-orange-400"
                            value={cookingTime}
                            min={5}
                            onChange={(e) => setCookingTime(Number(e.target.value))}
                        />
                    </div>
                    <div>
                        <label className="font-medium text-gray-700">Khẩu phần (người)</label>
                        <input
                            type="number"
                            className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-orange-400"
                            value={servings}
                            onChange={(e) => setServings(Number(e.target.value))}
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
                                    className="flex-1 p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-orange-400"
                                    required
                                />
                                <input
                                    placeholder="Số lượng"
                                    value={ing.amount}
                                    type="number"
                                    min={1}
                                    required
                                    onChange={(e) => handleIngredientChange(idx, "amount", e.target.value)}
                                    className="w-24 p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-orange-400"
                                />
                                <Select
                                    required
                                    options={unitOptions}
                                    value={unitOptions.find(opt => opt.value === Number(ing.unitId))}
                                    onChange={(e) => { handleIngredientChange(idx, "unitId", e.value) }}
                                    className="w-28 p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-orange-400"
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
                                        className="w-5 h-5 text-red-500 cursor-pointer"
                                        onClick={() => handleRemoveIngredient(idx)}
                                    />
                                )}
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={handleAddIngredient}
                            className="flex items-center text-green-600 gap-1 hover:text-green-700"
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
                                            className="w-5 h-5 text-red-400 cursor-pointer hover:text-red-500"
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
                                />
                                <div>
                                    <label className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-md cursor-pointer hover:bg-orange-600">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleStepImageUpload(idx, e)}
                                            className="hidden"
                                        />
                                        Chọn ảnh cho bước
                                    </label>
                                    {/* {step.imageUrl ? (
                                        <img src={step.imageUrl} alt={`step-${idx}`} className="w-32 h-24 object-cover rounded mt-2" />

                                    ) : (
                                        <p className="text-gray-500 mt-2">Chưa có ảnh cho bước này</p>
                                    )} */}
                                    {step.imageUrl ? (
                                        <div className="relative">
                                            <img
                                                src={step.imageUrl}
                                                alt={`step-${idx}`}
                                                className="w-32 h-24 object-cover rounded mt-2"
                                            />
                                            <TrashIcon
                                                className="absolute top-0 right-0 w-5 h-5 text-red-500 cursor-pointer"
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
                                className="flex items-center text-green-600 gap-1 hover:text-green-700"
                            >
                                <PlusIcon className="w-4 h-4" />
                                Thêm bước
                            </button>
                        )}
                    </div>
                </div>
                {/* Public/Private */}
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={(e) => handleSubmit(e, true)}
                        className={`px-4 py-2 ml-auto rounded-md font-semibold text-white bg-green-600 hover:bg-green-700
                        }`}
                    >
                        Lên sóng
                    </button>
                    <button
                        type="button"
                        onClick={(e) => handleSubmit(e, false)}
                        className={`px-4 py-2 rounded-md font-semibold text-white bg-gray-500 hover:bg-gray-600
                        }`}
                    >
                        Lưu trữ
                    </button>
                </div>
            </div>
        </form>
    );
};

export default CreateRecipe;