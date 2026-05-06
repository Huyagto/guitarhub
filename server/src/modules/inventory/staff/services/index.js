'use strict';

const { BadRequestError, NotFoundError } = require('../../../../core');
const { database: prisma } = require('../../../../config');
const inventoryRepository = require('../../shared/repositories/inventory.repository');

const getStaffBranchId = async (staffId) => {
    const staff = await prisma.user.findUnique({
        where: { id: Number(staffId) },
        select: { branchId: true },
    });

    if (!staff?.branchId) throw new BadRequestError('Nhân viên chưa được gán chi nhánh');
    return staff.branchId;
};

const getInventory = async (staffId) => inventoryRepository.findMany({ branchId: await getStaffBranchId(staffId) });

const ensureInventoryBelongsToStaffBranch = async (staffId, inventoryId) => {
    const branchId = await getStaffBranchId(staffId);
    const item = (await inventoryRepository.findMany({ branchId }))
        .find((inventoryItem) => inventoryItem.id === String(inventoryId));
    if (!item) throw new NotFoundError('Không tìm thấy mặt hàng tồn kho trong chi nhánh');
    return item;
};

const receiveInventory = async (staffId, inventoryId, { quantity, counterparty, note }) => {
    await ensureInventoryBelongsToStaffBranch(staffId, inventoryId);
    if (!Number.isFinite(quantity) || quantity <= 0) throw new BadRequestError('Số lượng nhập phải lớn hơn 0');
    return inventoryRepository.adjustStock(inventoryId, {
        type: 'RECEIVE',
        quantity,
        staffId,
        counterparty,
        note,
    });
};

const issueInventory = async (staffId, inventoryId, { quantity, counterparty, note }) => {
    await ensureInventoryBelongsToStaffBranch(staffId, inventoryId);
    if (!Number.isFinite(quantity) || quantity <= 0) throw new BadRequestError('Số lượng xuất phải lớn hơn 0');

    try {
        return await inventoryRepository.adjustStock(inventoryId, {
            type: 'ISSUE',
            quantity,
            staffId,
            counterparty,
            note,
        });
    } catch (error) {
        if (error.message === 'INSUFFICIENT_STOCK') throw new BadRequestError('Tồn kho không đủ để xuất');
        throw error;
    }
};

const getTransactions = async (staffId) => inventoryRepository.findTransactions({ branchId: await getStaffBranchId(staffId) });

module.exports = {
    getInventory,
    receiveInventory,
    issueInventory,
    getTransactions,
};
