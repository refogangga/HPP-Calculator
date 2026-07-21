-- CreateTable
CREATE TABLE `Menu` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `emoji` VARCHAR(191) NOT NULL DEFAULT '☕',
    `category` VARCHAR(191) NOT NULL DEFAULT 'Minuman',
    `margin` DOUBLE NOT NULL DEFAULT 50,
    `ingredients` JSON NOT NULL,
    `packaging` JSON NOT NULL,
    `ops` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OpexProfile` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `usePenyusutan` BOOLEAN NOT NULL DEFAULT true,
    `penyusutan` DOUBLE NOT NULL DEFAULT 0,
    `isTotalVolumeLocked` BOOLEAN NOT NULL DEFAULT true,
    `totalVolume` INTEGER NOT NULL DEFAULT 1000,
    `menuVolumes` JSON NOT NULL,
    `menuPrices` JSON NOT NULL,
    `selectedMenuIds` JSON NOT NULL,
    `assets` JSON NOT NULL,
    `expenses` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
