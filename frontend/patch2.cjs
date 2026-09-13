const fs = require('fs');
const path = 'E:/NovaGear/frontend/src/pages/ProductDetailPage.tsx';
let content = fs.readFileSync(path, 'utf8');

// replace import
content = content.replace('getRelatedProductsBySlug,', 'getSimilarProductsById,');

// replace useEffect
const oldEffect = `    useEffect(() => {
        if (!slug) {
            setRelatedProducts([])
            return
        }

        const loadRelatedProducts = async () => {
            try {
                setRelatedLoading(true)
                const items = await getRelatedProductsBySlug(slug, 8)
                setRelatedProducts(items)
            } catch (error) {
                console.error(error)
                setRelatedProducts([])
            } finally {
                setRelatedLoading(false)
            }
        }

        loadRelatedProducts()
    }, [slug])`;

const newEffect = `    useEffect(() => {
        if (!product?.id) {
            setRelatedProducts([])
            return
        }

        const loadRelatedProducts = async () => {
            try {
                setRelatedLoading(true)
                const items = await getSimilarProductsById(product.id, 8)
                setRelatedProducts(items)
            } catch (error) {
                console.error(error)
                setRelatedProducts([])
            } finally {
                setRelatedLoading(false)
            }
        }

        loadRelatedProducts()
    }, [product?.id])`;

// normalize and replace
content = content.replace(/\r\n/g, '\n');
content = content.replace(oldEffect, newEffect);

fs.writeFileSync(path, content, 'utf8');
console.log('done');
