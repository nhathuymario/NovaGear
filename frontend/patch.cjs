const fs = require('fs');
const path = 'E:/NovaGear/frontend/src/pages/admin/AdminProductsPage.tsx';
let content = fs.readFileSync(path, 'utf8');

const p1 = `                        <p className="text-sm text-gray-500">Điền thông tin cơ bản của sản phẩm</p>
                    </div>
                </div>`;

const r1 = `                        <p className="text-sm text-gray-500">Điền thông tin cơ bản của sản phẩm</p>
                    </div>
                    <div className="ml-auto flex items-center">
                        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 transition hover:bg-gray-50">
                            <input
                                type="checkbox"
                                checked={autoEnhanceImage}
                                onChange={(e) => setAutoEnhanceImage(e.target.checked)}
                                className="h-4 w-4 rounded accent-gray-900"
                            />
                            <span className="text-sm font-medium text-gray-700">AI xử lý ảnh (Căn giữa)</span>
                        </label>
                    </div>
                </div>`;

const p2 = `                                        placeholder="Mô tả tóm tắt hiển thị trong danh sách"
                                        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-gray-900"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="mb-1.5 block text-xs font-medium text-gray-600">Mô tả chi tiết</label>`;

const r2 = `                                        placeholder="Mô tả tóm tắt hiển thị trong danh sách"
                                        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-gray-900"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="mb-1.5 block text-xs font-medium text-gray-600">Tags sản phẩm</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={(productForm.tags ?? []).join(", ")}
                                            onChange={(e) => setProductForm({
                                                ...productForm,
                                                tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean)
                                            })}
                                            placeholder="Tag1, Tag2, Tag3..."
                                            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-gray-900"
                                        />
                                        <button
                                            type="button"
                                            disabled={taggingStatus === 'LOADING' || !productForm.name}
                                            onClick={async () => {
                                                if (!productForm.name) {
                                                    toast.info('Vui lòng nhập tên sản phẩm trước khi tạo tags tự động');
                                                    return;
                                                }
                                                setTaggingStatus('LOADING');
                                                try {
                                                    const res = await generateCatalogTags(productForm.name, productForm.description ?? '');
                                                    setProductForm({
                                                        ...productForm,
                                                        tags: res.tags
                                                    });
                                                    toast.success('AI đã tạo tags thành công');
                                                } catch (e) {
                                                    console.error(e);
                                                    toast.error('Tạo tags tự động thất bại');
                                                } finally {
                                                    setTaggingStatus('IDLE');
                                                }
                                            }}
                                            className="whitespace-nowrap rounded-xl bg-blue-50 px-4 py-2.5 text-sm font-medium text-blue-700 transition hover:bg-blue-100 disabled:opacity-50"
                                        >
                                            {taggingStatus === 'LOADING' ? 'Đang tạo...' : '✨ AI Auto Tag'}
                                        </button>
                                    </div>
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="mb-1.5 block text-xs font-medium text-gray-600">Mô tả chi tiết</label>`;

// normalize newlines for search and replace
content = content.replace(/\r\n/g, '\n');

if (content.includes(p1)) {
    content = content.replace(p1, r1);
} else {
    console.error("Part 1 not found");
}

if (content.includes(p2)) {
    content = content.replace(p2, r2);
} else {
    console.error("Part 2 not found");
}

fs.writeFileSync(path, content, 'utf8');
console.log('done');
