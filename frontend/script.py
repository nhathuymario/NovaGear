import io
import sys

def main():
    path = 'E:/NovaGear/frontend/src/pages/admin/AdminProductsPage.tsx'
    with io.open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    part1_search = '''                        <p className="text-sm text-gray-500">Ði?n thông tin co b?n c?a s?n ph?m</p>
                    </div>
                </div>'''

    part1_replace = '''                        <p className="text-sm text-gray-500">Ði?n thông tin co b?n c?a s?n ph?m</p>
                    </div>
                    <div className="ml-auto flex items-center">
                        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 transition hover:bg-gray-50">
                            <input
                                type="checkbox"
                                checked={autoEnhanceImage}
                                onChange={(e) => setAutoEnhanceImage(e.target.checked)}
                                className="h-4 w-4 rounded accent-gray-900"
                            />
                            <span className="text-sm font-medium text-gray-700">AI x? lý ?nh (Can gi?a)</span>
                        </label>
                    </div>
                </div>'''

    part2_search = '''                                        placeholder="Mô t? tóm t?t hi?n th? trong danh sách"
                                        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-gray-900"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="mb-1.5 block text-xs font-medium text-gray-600">Mô t? chi ti?t</label>'''

    part2_replace = '''                                        placeholder="Mô t? tóm t?t hi?n th? trong danh sách"
                                        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-gray-900"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="mb-1.5 block text-xs font-medium text-gray-600">Tags s?n ph?m</label>
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
                                            disabled={taggingStatus === "LOADING" || !productForm.name}
                                            onClick={async () => {
                                                if (!productForm.name) {
                                                    toast.info("Vui lòng nh?p tên s?n ph?m tru?c khi t?o tags t? d?ng");
                                                    return;
                                                }
                                                setTaggingStatus("LOADING");
                                                try {
                                                    const res = await generateCatalogTags(productForm.name, productForm.description ?? "");
                                                    setProductForm({
                                                        ...productForm,
                                                        tags: res.tags
                                                    });
                                                    toast.success("AI dã t?o tags thành công");
                                                } catch (e) {
                                                    console.error(e);
                                                    toast.error("T?o tags t? d?ng th?t b?i");
                                                } finally {
                                                    setTaggingStatus("IDLE");
                                                }
                                            }}
                                            className="whitespace-nowrap rounded-xl bg-blue-50 px-4 py-2.5 text-sm font-medium text-blue-700 transition hover:bg-blue-100 disabled:opacity-50"
                                        >
                                            {taggingStatus === "LOADING" ? "Ðang t?o..." : "? AI Auto Tag"}
                                        </button>
                                    </div>
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="mb-1.5 block text-xs font-medium text-gray-600">Mô t? chi ti?t</label>'''

    # normalize newlines to \n to make replacement easier
    content = content.replace('\\r\\n', '\\n')

    if part1_search in content:
        content = content.replace(part1_search, part1_replace)
    else:
        print("Part 1 not found!")

    if part2_search in content:
        content = content.replace(part2_search, part2_replace)
    else:
        print("Part 2 not found!")

    # convert back to original line endings if needed or just let it be \n
    with io.open(path, 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == '__main__':
    main()
