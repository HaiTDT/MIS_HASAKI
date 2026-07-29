import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function generateSlug(text: string): string {
    return text.toString().toLowerCase()
        .replace(/á|à|ả|ạ|ã|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/gi, 'a')
        .replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/gi, 'e')
        .replace(/i|í|ì|ỉ|ĩ|ị/gi, 'i')
        .replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/gi, 'o')
        .replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/gi, 'u')
        .replace(/ý|ỳ|ỷ|ỹ|ỵ/gi, 'y')
        .replace(/đ/gi, 'd')
        .replace(/\`|\~|\!|\@|\#|\||\$|\%|\^|\&|\*|\(|\)|\+|\=|\,|\.|\/|\?|\>|\<|\'|\"|\:|\;|_/gi, '')
        .replace(/ /gi, "-")
        .replace(/\-\-\-\-\-/gi, '-')
        .replace(/\-\-\-\-/gi, '-')
        .replace(/\-\-\-/gi, '-')
        .replace(/\-\-/gi, '-')
        .replace(/^\-|\-$/gi, '');
}

function parsePrice(priceStr: string): number {
    if (!priceStr) return 0;
    const cleaned = priceStr.replace(/[^\d]/g, '');
    const val = parseInt(cleaned, 10);
    return isNaN(val) ? 0 : val;
}

// Hàm phân loại sản phẩm vào 5 danh mục lớn
function getCategoryInfo(url: string = '', name: string = ''): { name: string; slug: string } {
    const urlLower = url.toLowerCase();
    const nameLower = name.toLowerCase();

    // 1. Nước hoa
    if (
        urlLower.includes('nuoc-hoa') || urlLower.includes('perfume') || urlLower.includes('xit-thom') || urlLower.includes('body-mist') ||
        nameLower.includes('nước hoa') || nameLower.includes('perfume') || nameLower.includes('body mist') || nameLower.includes('xịt thơm')
    ) {
        return { name: 'Nước hoa', slug: 'nuoc-hoa' };
    }

    // 2. Chăm sóc tóc
    if (
        urlLower.includes('dau-goi') || urlLower.includes('dau-xa') || urlLower.includes('duong-toc') || urlLower.includes('cham-soc-toc') || urlLower.includes('dau-xit-duong-toc') ||
        nameLower.includes('dầu gội') || nameLower.includes('dầu xả') || nameLower.includes('dưỡng tóc') || nameLower.includes('kem ủ tóc') || nameLower.includes('shampoo') || nameLower.includes('conditioner') || nameLower.includes('xịt tóc')
    ) {
        return { name: 'Chăm sóc tóc', slug: 'cham-soc-toc' };
    }

    // 3. Trang điểm
    if (
        urlLower.includes('trang-diem') || urlLower.includes('son-') || urlLower.includes('phan-') || urlLower.includes('kem-nen') || urlLower.includes('cushion') || urlLower.includes('mascara') || urlLower.includes('ke-mat') || urlLower.includes('ma-hong') || urlLower.includes('che-khuyet-diem') ||
        nameLower.includes('son ') || nameLower.includes('son kem') || nameLower.includes('son dưỡng') || nameLower.includes('son tint') || nameLower.includes('son thỏi') || nameLower.includes('phấn') || nameLower.includes('kem nền') || nameLower.includes('cushion') || nameLower.includes('má hồng') || nameLower.includes('mascara') || nameLower.includes('kẻ mắt') || nameLower.includes('eyeliner') || nameLower.includes('che khuyết điểm') || nameLower.includes('chì kẻ') || nameLower.includes('tẩy trang mắt môi') || nameLower.includes('bút kẻ')
    ) {
        return { name: 'Trang điểm', slug: 'trang-diem' };
    }

    // 4. Chăm sóc cơ thể
    if (
        urlLower.includes('sua-tam') || urlLower.includes('duong-the') || urlLower.includes('rang-mieng') || urlLower.includes('co-the') || urlLower.includes('khu-mui') || urlLower.includes('lan-nach') ||
        nameLower.includes('sữa tắm') || nameLower.includes('dưỡng thể') || nameLower.includes('lăn khử mùi') || nameLower.includes('kem đánh răng') || nameLower.includes('bàn chải') || nameLower.includes('nước súc miệng') || nameLower.includes('body lotion') || nameLower.includes('shower gel') || nameLower.includes('sữa dưỡng thể') || nameLower.includes('lăn nách') || nameLower.includes('khử mùi') || nameLower.includes('gel tắm')
    ) {
        return { name: 'Chăm sóc cơ thể', slug: 'cham-soc-co-the' };
    }

    // 5. Chăm sóc da (Default)
    return { name: 'Chăm sóc da', slug: 'cham-soc-da' };
}

const MAJOR_CATEGORIES = [
    { name: 'Chăm sóc da', slug: 'cham-soc-da', description: 'Các sản phẩm chăm sóc da mặt, dưỡng da' },
    { name: 'Trang điểm', slug: 'trang-diem', description: 'Các sản phẩm trang điểm môi, mặt, mắt' },
    { name: 'Chăm sóc tóc', slug: 'cham-soc-toc', description: 'Dầu gội, dầu xả, dưỡng tóc và tạo kiểu' },
    { name: 'Chăm sóc cơ thể', slug: 'cham-soc-co-the', description: 'Sữa tắm, dưỡng thể, khử mùi, răng miệng' },
    { name: 'Nước hoa', slug: 'nuoc-hoa', description: 'Nước hoa nam nữ, xịt thơm toàn thân' }
];

async function main() {
    console.log('=== BƯỚC 1: XÓA SẠCH DỮ LIỆU CŨ ===');
    try {
        console.log('Đang xóa dữ liệu theo thứ tự ràng buộc khóa ngoại...');
        await prisma.flashSaleItem.deleteMany({});
        await prisma.flashSaleCampaign.deleteMany({});
        await prisma.review.deleteMany({});
        await prisma.orderItem.deleteMany({});
        await prisma.order.deleteMany({});
        await prisma.cartItem.deleteMany({});
        await prisma.cart.deleteMany({});
        await prisma.favoriteProduct.deleteMany({});
        await prisma.product.deleteMany({});
        await prisma.category.deleteMany({});
        console.log('Đã xóa sạch dữ liệu cũ thành công.');
    } catch (e: any) {
        console.error('Lỗi khi xóa dữ liệu cũ:', e.message);
        throw e;
    }

    console.log('\n=== BƯỚC 2: KHỞI TẠO 5 DANH MỤC LỚN ===');
    const categoryIdMap = new Map<string, string>(); // slug -> id
    for (const catInfo of MAJOR_CATEGORIES) {
        const cat = await prisma.category.create({
            data: {
                name: catInfo.name,
                slug: catInfo.slug,
                description: catInfo.description
            }
        });
        categoryIdMap.set(catInfo.slug, cat.id);
        console.log(`Đã tạo danh mục: ${cat.name} (${cat.slug}) -> ID: ${cat.id}`);
    }

    console.log('\n=== BƯỚC 3: ĐỌC VÀ PARSE CSV ===');
    const filePath = path.join(__dirname, '../../data/hasaki_products_merged.csv');
    console.log(`Đang đọc file: ${filePath}`);
    
    if (!fs.existsSync(filePath)) {
        throw new Error(`Không tìm thấy file CSV tại đường dẫn: ${filePath}`);
    }

    const rawRows: any[] = [];
    await new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => rawRows.push(data))
            .on('end', () => resolve(true))
            .on('error', (err) => reject(err));
    });
    
    console.log(`Đã đọc được ${rawRows.length} dòng từ file CSV. Đang xử lý sản phẩm...`);

    const slugSet = new Set<string>();
    const productsToInsert: any[] = [];
    
    let processedCount = 0;
    for (const row of rawRows) {
        const nameKey = Object.keys(row).find(k => k.includes('Tên sản phẩm')) || 'Tên sản phẩm';
        const name = row[nameKey]?.trim()?.replace(/^\uFEFF/, '');
        if (!name) continue;

        // Xác định danh mục
        const catInfo = getCategoryInfo(row['Nguồn'] || '', name);
        const categoryId = categoryIdMap.get(catInfo.slug);
        if (!categoryId) {
            console.warn(`Bỏ qua sản phẩm "${name}" vì không xác định được danh mục ID cho slug ${catInfo.slug}`);
            continue;
        }

        // Tạo slug duy nhất
        const baseSlug = generateSlug(name);
        let slug = baseSlug;
        let counter = 1;
        while (slugSet.has(slug)) {
            slug = `${baseSlug}-${counter}`;
            counter++;
        }
        slugSet.add(slug);

        // Chuẩn bị mô tả
        let description = '';
        if (row['Mô tả ngắn']) description += `Mô tả ngắn: ${row['Mô tả ngắn']}\n\n`;
        if (row['Mô tả']) description += `${row['Mô tả']}\n\n`;
        if (row['Thành phần']) description += `Thành phần: ${row['Thành phần']}\n\n`;
        if (row['HDSD']) description += `Hướng dẫn sử dụng: ${row['HDSD']}`;

        // Chuẩn bị dữ liệu sản phẩm
        productsToInsert.push({
            name,
            slug,
            description: description.trim() || null,
            brand: row['Thương hiệu']?.trim() || null,
            price: parsePrice(row['Giá hiện tại']),
            imageUrl: row['Ảnh']?.trim() || null,
            stock: 100, // Stock mặc định
            categoryId,
            isActive: true,
            isFlashSale: false
        });

        processedCount++;
    }

    console.log(`\nTổng hợp: Đã chuẩn bị ${productsToInsert.length} sản phẩm hợp lệ để lưu vào cơ sở dữ liệu.`);

    console.log('\n=== BƯỚC 4: LƯU SẢN PHẨM VÀO DATABASE ===');
    // Lưu sản phẩm theo từng lô để đảm bảo hiệu suất và tránh lỗi kết nối
    const batchSize = 100;
    let successCount = 0;

    for (let i = 0; i < productsToInsert.length; i += batchSize) {
        const batch = productsToInsert.slice(i, i + batchSize);
        try {
            // Dùng transaction để insert từng sản phẩm một cách an toàn
            await prisma.$transaction(
                batch.map(p => prisma.product.create({ data: p }))
            );
            successCount += batch.length;
            if (successCount % 500 === 0 || successCount === productsToInsert.length) {
                console.log(`Đã lưu thành công ${successCount}/${productsToInsert.length} sản phẩm...`);
            }
        } catch (err: any) {
            console.error(`Lỗi khi lưu batch từ chỉ số ${i}:`, err.message);
            // Nếu batch lỗi, ta thử lưu từng cái để cô lập lỗi
            for (const p of batch) {
                try {
                    await prisma.product.create({ data: p });
                    successCount++;
                } catch (singleErr: any) {
                    console.error(`Lỗi chi tiết khi lưu sản phẩm "${p.name}":`, singleErr.message);
                }
            }
        }
    }

    console.log(`\nHoàn thành! Đã nhập thành công ${successCount} sản phẩm vào database.`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
