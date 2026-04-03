import React, { useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Mail, Phone, Calendar, LogOut, Trash2, Edit3, ChevronRight, Settings, ArrowLeft } from 'lucide-react-native';

import { Card, CardContent } from '../../components/ui/Card';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { logout, updateUserProfile as updateUserProfileState } from '../../store/authSlice';
import { signOut, deleteUserProfile, updateUserProfile as updateUserProfileApi, storeUserProfile } from '../../services/authService';
import { useNavigation } from '@react-navigation/native';
import { notifyAlert } from '../../utils/notification';

export function ProfileScreen() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [editBirthdate, setEditBirthdate] = useState('');
  const [editGender, setEditGender] = useState('');
  
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const navigation = useNavigation();

  const performLogout = async () => {
    try {
      setIsLoggingOut(true);
      console.log('Starting logout...');
      
      // Sign out from Cognito (clears browser session)
      await signOut();
      console.log('Cognito signout complete');
      
      // Clear Redux state
      dispatch(logout());
      console.log('Redux state cleared');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if Cognito logout fails, clear local state
      dispatch(logout());
    } finally {
      setIsLoggingOut(false);
      setShowLogoutModal(false);
    }
  };

  const performDelete = async () => {
    if (!user?.id) return;
    
    try {
      setIsDeleting(true);
      
      // Delete from backend
      await deleteUserProfile(user.id);
      
      // Sign out completely
      await signOut();
      
      // Clear Redux state
      dispatch(logout());
    } catch (error: any) {
      console.error('Delete account error:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const openEditProfile = () => {
    setEditBirthdate(user?.birthdate || '');
    setEditGender((user?.gender || '').toUpperCase());
    setShowEditModal(true);
  };

  const saveProfileChanges = async () => {
    if (!user?.id) return;

    if (editBirthdate && Number.isNaN(new Date(editBirthdate).getTime())) {
      notifyAlert('Lỗi', 'Ngày sinh không hợp lệ. Dùng định dạng YYYY-MM-DD');
      return;
    }

    if (editGender && !['MALE', 'FEMALE'].includes(editGender)) {
      notifyAlert('Lỗi', 'Giới tính chỉ hỗ trợ MALE hoặc FEMALE');
      return;
    }

    try {
      setSavingProfile(true);

      const payload = {
        email: user?.email,
        name: user?.name,
        picture: user?.picture,
        username: user?.username || user?.userName,
        birthdate: editBirthdate || undefined,
        gender: editGender || undefined,
        phoneNumber: user?.phoneNumber,
      };

      await updateUserProfileApi(user.id, payload);

      const updatedUser = {
        ...user,
        birthdate: editBirthdate || undefined,
        gender: editGender || undefined,
      };

      dispatch(updateUserProfileState({
        birthdate: updatedUser.birthdate,
        gender: updatedUser.gender,
      }));
      await storeUserProfile(updatedUser);

      notifyAlert('Thành công', 'Đã cập nhật thông tin cá nhân.');
      setShowEditModal(false);
    } catch (error: any) {
      notifyAlert('Lỗi', error?.message || 'Không thể cập nhật hồ sơ.');
    } finally {
      setSavingProfile(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Chưa cập nhật';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN');
    } catch {
      return dateString;
    }
  };

  const getGenderText = (gender?: string) => {
    if (!gender) return 'Chưa cập nhật';
    switch (gender.toLowerCase()) {
      case 'male': return 'Nam';
      case 'female': return 'Nữ';
      default: return gender;
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <View className="rounded-b-[32px] overflow-hidden">
        <LinearGradient
          colors={['#f97316', '#ef4444']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="pb-20"
        >
          <SafeAreaView edges={['top', 'left', 'right']} className="p-6">
            <View className="flex-row justify-between items-center mb-6">
              <View className="flex-row items-center">
                <TouchableOpacity 
                  onPress={() => navigation.goBack()}
                  className="mr-4 w-10 h-10 bg-white/20 rounded-full items-center justify-center"
                >
                  <ArrowLeft color="white" size={24} />
                </TouchableOpacity>
                <Text className="text-2xl font-bold text-white">Tài khoản</Text>
              </View>
              <View className="w-10 h-10 bg-white/20 rounded-full items-center justify-center">
                <Settings color="white" size={20} />
              </View>
            </View>

            {/* Profile Summary */}
            <View className="items-center">
              {user?.picture ? (
                <Image
                  source={{ uri: user.picture }}
                  className="w-20 h-20 rounded-full border-4 border-white/30"
                />
              ) : (
                <View className="w-20 h-20 rounded-full bg-white/20 items-center justify-center border-4 border-white/30">
                  <User color="white" size={36} />
                </View>
              )}
              <Text className="text-xl font-bold text-white mt-3">
                {user?.name || user?.userName || 'Người dùng'}
              </Text>
              {user?.email && (
                <Text className="text-white/80 mt-1">{user.email}</Text>
              )}
            </View>
          </SafeAreaView>
        </LinearGradient>
        </View>

        {/* Content */}
        <View className="px-6 -mt-12">
          {/* Profile Info Card */}
          <Card className="mb-4 shadow-lg border-none">
            <CardContent>
              <Text className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Thông tin cá nhân
              </Text>
              <ProfileRow 
                icon={<Mail color="#9ca3af" size={20} />}
                label="Email"
                value={user?.email || 'Chưa cập nhật'}
              />
              <ProfileRow 
                icon={<Phone color="#9ca3af" size={20} />}
                label="Số điện thoại"
                value={user?.phoneNumber || 'Chưa cập nhật'}
              />
              <ProfileRow 
                icon={<Calendar color="#9ca3af" size={20} />}
                label="Ngày sinh"
                value={formatDate(user?.birthdate)}
              />
              <ProfileRow 
                icon={<User color="#9ca3af" size={20} />}
                label="Giới tính"
                value={getGenderText(user?.gender)}
                isLast
              />
            </CardContent>
          </Card>

          {/* Actions Card */}
          <Card className="mb-4 shadow-lg border-none">
            <CardContent className="p-0">
              {/* Edit Profile */}
              <TouchableOpacity 
                className="flex-row items-center justify-between p-4 border-b border-gray-100"
                onPress={openEditProfile}
                activeOpacity={0.7}
              >
                <View className="flex-row items-center">
                  <View className="w-10 h-10 rounded-full bg-orange-100 items-center justify-center mr-3">
                    <Edit3 color="#f97316" size={20} />
                  </View>
                  <Text className="text-gray-900 font-medium text-base">Chỉnh sửa hồ sơ</Text>
                </View>
                <ChevronRight color="#9ca3af" size={20} />
              </TouchableOpacity>

              {/* Logout */}
              <TouchableOpacity 
                className="flex-row items-center justify-between p-4"
                onPress={() => setShowLogoutModal(true)}
                disabled={isLoggingOut}
                activeOpacity={0.7}
              >
                <View className="flex-row items-center">
                  <View className="w-10 h-10 rounded-full bg-red-100 items-center justify-center mr-3">
                    {isLoggingOut ? (
                      <ActivityIndicator size="small" color="#ef4444" />
                    ) : (
                      <LogOut color="#ef4444" size={20} />
                    )}
                  </View>
                  <Text className="text-red-500 font-medium text-base">
                    {isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
                  </Text>
                </View>
              </TouchableOpacity>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="shadow-lg border-none">
            <CardContent className="p-0">
              <View className="px-4 pt-4 pb-2">
                <Text className="text-xs text-gray-400 uppercase tracking-wider">
                  Vùng nguy hiểm
                </Text>
              </View>
              <TouchableOpacity 
                className="flex-row items-center justify-between p-4"
                onPress={() => setShowDeleteModal(true)}
                disabled={isDeleting}
                activeOpacity={0.7}
              >
                <View className="flex-row items-center">
                  <View className="w-10 h-10 rounded-full bg-red-100 items-center justify-center mr-3">
                    {isDeleting ? (
                      <ActivityIndicator size="small" color="#ef4444" />
                    ) : (
                      <Trash2 color="#ef4444" size={20} />
                    )}
                  </View>
                  <View>
                    <Text className="text-red-500 font-medium text-base">
                      {isDeleting ? 'Đang xóa...' : 'Xóa tài khoản'}
                    </Text>
                    <Text className="text-gray-400 text-xs">Không thể hoàn tác</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </CardContent>
          </Card>
        </View>
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        visible={showLogoutModal}
        title="Đăng xuất"
        message="Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?"
        confirmText="Đăng xuất"
        cancelText="Hủy"
        variant="warning"
        onConfirm={performLogout}
        onCancel={() => setShowLogoutModal(false)}
        isLoading={isLoggingOut}
      />

      {/* Delete Account Confirmation Modal */}
      <ConfirmModal
        visible={showDeleteModal}
        title="Xóa tài khoản"
        message="Hành động này không thể hoàn tác. Tất cả dữ liệu của bạn sẽ bị xóa vĩnh viễn."
        confirmText="Xóa tài khoản"
        cancelText="Hủy"
        variant="danger"
        onConfirm={performDelete}
        onCancel={() => setShowDeleteModal(false)}
        isLoading={isDeleting}
      />

      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View className="flex-1 bg-black/40 justify-end">
          <View className="bg-white rounded-t-3xl px-6 pt-6 pb-8">
            <Text className="text-lg font-bold text-gray-900 mb-4">Chỉnh sửa thông tin cá nhân</Text>

            <Text className="text-sm font-semibold text-gray-700 mb-2">Ngày sinh (YYYY-MM-DD)</Text>
            <TextInput
              value={editBirthdate}
              onChangeText={setEditBirthdate}
              placeholder="2000-06-15"
              className="bg-gray-100 rounded-xl px-4 py-3 mb-4"
            />

            <Text className="text-sm font-semibold text-gray-700 mb-2">Giới tính</Text>
            <View className="flex-row gap-2 mb-6">
              <TouchableOpacity
                onPress={() => setEditGender('MALE')}
                className={`px-3 py-2 rounded ${editGender === 'MALE' ? 'bg-orange-200' : 'bg-gray-100'}`}
              >
                <Text>Nam</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setEditGender('FEMALE')}
                className={`px-3 py-2 rounded ${editGender === 'FEMALE' ? 'bg-orange-200' : 'bg-gray-100'}`}
              >
                <Text>Nữ</Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setShowEditModal(false)}
                className="flex-1 border border-gray-200 rounded-2xl py-3 items-center"
                disabled={savingProfile}
              >
                <Text className="text-gray-600 font-semibold">Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={saveProfileChanges}
                className="flex-1 bg-orange-500 rounded-2xl py-3 items-center"
                disabled={savingProfile}
                style={{ opacity: savingProfile ? 0.8 : 1 }}
              >
                <Text className="text-white font-semibold">{savingProfile ? 'Đang lưu...' : 'Lưu'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Helper component for profile rows
function ProfileRow({ icon, label, value, isLast = false }: { icon: React.ReactNode; label: string; value: string; isLast?: boolean }) {
  return (
    <View className={`flex-row items-center py-3 ${!isLast ? 'border-b border-gray-100' : ''}`}>
      <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-3">
        {icon}
      </View>
      <View className="flex-1">
        <Text className="text-xs text-gray-400 uppercase tracking-wider">{label}</Text>
        <Text className="text-gray-900 font-medium">{value}</Text>
      </View>
    </View>
  );
}
