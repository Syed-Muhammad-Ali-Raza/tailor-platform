-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CUSTOMER', 'TAILOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "Audience" AS ENUM ('MEN', 'WOMEN');

-- CreateEnum
CREATE TYPE "Category" AS ENUM ('SHALWAR_KAMEEZ', 'KURTA', 'WAISTCOAT', 'KAMEEZ_SHALWAR', 'SUIT', 'TROUSER', 'OTHER');

-- CreateEnum
CREATE TYPE "GarmentType" AS ENUM ('MEN_SHALWAR_KAMEEZ', 'MEN_KURTA', 'MEN_TROUSER', 'WOMEN_KAMEEZ', 'WOMEN_BOTTOM');

-- CreateEnum
CREATE TYPE "OptionType" AS ENUM ('COLLAR', 'CUFF', 'FRONT', 'POCKET', 'TROUSER_STYLE', 'NECKLINE', 'SLEEVE', 'SHAPE', 'BOTTOM_STYLE', 'EXTRA');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PLACED', 'ACCEPTED', 'MEASUREMENTS_CONFIRMED', 'STITCHING', 'QUALITY_CHECK', 'READY', 'DELIVERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DeliveryType" AS ENUM ('DELIVERY', 'PICKUP');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('COD', 'PAY_AT_PICKUP');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'REFUNDED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'CUSTOMER',
    "language" TEXT NOT NULL DEFAULT 'en',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tailor" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "shopName" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "whatsapp" TEXT NOT NULL,
    "bio" TEXT NOT NULL DEFAULT '',
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "servesWomen" BOOLEAN NOT NULL DEFAULT true,
    "femaleStaff" BOOLEAN NOT NULL DEFAULT false,
    "portfolioImages" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tailor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Design" (
    "id" TEXT NOT NULL,
    "tailorId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "audience" "Audience" NOT NULL,
    "category" "Category" NOT NULL,
    "basePrice" DECIMAL(10,2) NOT NULL,
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Design_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fabric" (
    "id" TEXT NOT NULL,
    "designId" TEXT NOT NULL,
    "tailorId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "pricePerMeter" DECIMAL(10,2) NOT NULL,
    "extraCharge" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "image" TEXT,

    CONSTRAINT "Fabric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StyleOption" (
    "id" TEXT NOT NULL,
    "designId" TEXT NOT NULL,
    "tailorId" TEXT NOT NULL,
    "type" "OptionType" NOT NULL,
    "name" TEXT NOT NULL,
    "extraPrice" DECIMAL(10,2) NOT NULL DEFAULT 0,

    CONSTRAINT "StyleOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Measurement" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "garmentType" "GarmentType" NOT NULL,
    "values" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Measurement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "tailorId" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PLACED',
    "totalPrice" DECIMAL(10,2) NOT NULL,
    "finalPrice" DECIMAL(10,2),
    "deliveryType" "DeliveryType" NOT NULL,
    "dueDate" TIMESTAMP(3),
    "notes" TEXT,
    "referencePhotoUrl" TEXT,
    "cancelReason" TEXT,
    "quotedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "designId" TEXT NOT NULL,
    "fabricId" TEXT,
    "measurementId" TEXT,
    "designName" TEXT NOT NULL,
    "fabricName" TEXT,
    "quantity" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "selectedOptions" JSONB NOT NULL DEFAULT '[]',

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderStatusEvent" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "from" "OrderStatus",
    "to" "OrderStatus" NOT NULL,
    "note" TEXT,
    "actorUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderStatusEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TryOnRequest" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "designId" TEXT NOT NULL,
    "inputImage" TEXT,
    "outputImage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TryOnRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Tailor_userId_key" ON "Tailor"("userId");

-- CreateIndex
CREATE INDEX "Tailor_city_idx" ON "Tailor"("city");

-- CreateIndex
CREATE INDEX "Design_tailorId_active_idx" ON "Design"("tailorId", "active");

-- CreateIndex
CREATE INDEX "Design_audience_active_idx" ON "Design"("audience", "active");

-- CreateIndex
CREATE INDEX "Fabric_designId_idx" ON "Fabric"("designId");

-- CreateIndex
CREATE INDEX "StyleOption_designId_idx" ON "StyleOption"("designId");

-- CreateIndex
CREATE INDEX "Measurement_customerId_garmentType_idx" ON "Measurement"("customerId", "garmentType");

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");

-- CreateIndex
CREATE INDEX "Order_customerId_createdAt_idx" ON "Order"("customerId", "createdAt");

-- CreateIndex
CREATE INDEX "Order_tailorId_status_idx" ON "Order"("tailorId", "status");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- CreateIndex
CREATE INDEX "OrderStatusEvent_orderId_createdAt_idx" ON "OrderStatusEvent"("orderId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_orderId_key" ON "Payment"("orderId");

-- CreateIndex
CREATE INDEX "TryOnRequest_customerId_createdAt_idx" ON "TryOnRequest"("customerId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Review_orderId_key" ON "Review"("orderId");

-- AddForeignKey
ALTER TABLE "Tailor" ADD CONSTRAINT "Tailor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Design" ADD CONSTRAINT "Design_tailorId_fkey" FOREIGN KEY ("tailorId") REFERENCES "Tailor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fabric" ADD CONSTRAINT "Fabric_designId_fkey" FOREIGN KEY ("designId") REFERENCES "Design"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fabric" ADD CONSTRAINT "Fabric_tailorId_fkey" FOREIGN KEY ("tailorId") REFERENCES "Tailor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StyleOption" ADD CONSTRAINT "StyleOption_designId_fkey" FOREIGN KEY ("designId") REFERENCES "Design"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StyleOption" ADD CONSTRAINT "StyleOption_tailorId_fkey" FOREIGN KEY ("tailorId") REFERENCES "Tailor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Measurement" ADD CONSTRAINT "Measurement_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_tailorId_fkey" FOREIGN KEY ("tailorId") REFERENCES "Tailor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_designId_fkey" FOREIGN KEY ("designId") REFERENCES "Design"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_fabricId_fkey" FOREIGN KEY ("fabricId") REFERENCES "Fabric"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_measurementId_fkey" FOREIGN KEY ("measurementId") REFERENCES "Measurement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderStatusEvent" ADD CONSTRAINT "OrderStatusEvent_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TryOnRequest" ADD CONSTRAINT "TryOnRequest_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TryOnRequest" ADD CONSTRAINT "TryOnRequest_designId_fkey" FOREIGN KEY ("designId") REFERENCES "Design"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
