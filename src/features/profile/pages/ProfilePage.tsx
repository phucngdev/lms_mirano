import { useEffect, useState } from 'react';
import {
  Form,
  Input,
  Button,
  Select,
  DatePicker,
  Upload,
  message,
  Card,
  Avatar,
  Spin,
  Tabs,
} from 'antd';
import {
  UserOutlined,
  CameraOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import type { UploadProps } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import {
  getProfileService,
  putUpdateProfileService,
  putUpdatePassService,
} from '#/api/services/user.service';
import type { UpdateUserDto } from '#/api/requests';
import './ProfilePage.scss';

const { Option } = Select;
const { TabPane } = Tabs;

interface UserProfile {
  id: string;
  email: string;
  avatarUrl?: string;
  fullName: string;
  phoneNumber: string;
  address?: string;
  isActive: boolean;
  userCode: number;
  q: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  birthday?: string;
  userType: string;
  userProfiles: string[];
  level?: 'N1' | 'N2' | 'N3' | 'N4' | 'N5';
  national?: 'VIETNAM' | 'JAPAN';
}

interface ApiProfileResponse {
  statusCode: number;
  data: UserProfile;
}

const ProfilePage = () => {
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await getProfileService();
      const apiData: ApiProfileResponse = response.data;

      if (apiData.statusCode === 200 && apiData.data) {
        setUserProfile(apiData.data);
        // Set form values
        profileForm.setFieldsValue({
          fullName: apiData.data.fullName,
          phoneNumber: apiData.data.phoneNumber,
          address: apiData.data.address || '',
          gender: apiData.data.gender || undefined,
          national: apiData.data.national || undefined,
          level: apiData.data.level || undefined,
          birthday: apiData.data.birthday
            ? dayjs(apiData.data.birthday)
            : undefined,
          userProfiles: apiData.data.userProfiles[0] || 'STUDENT',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      message.error('Không thể tải thông tin cá nhân');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (values: any) => {
    try {
      setUpdating(true);
      const updateData: UpdateUserDto = {
        fullName: values.fullName,
        phoneNumber: values.phoneNumber,
        address: values.address || null,
        gender: values.gender || null,
        national: values.national || null,
        level: values.level || null,
        birthday: values.birthday ? values.birthday.toISOString() : null,
        userProfiles: values.userProfiles,
      };

      const response = await putUpdateProfileService(updateData);
      if (response.data.statusCode === 200) {
        message.success('Cập nhật thông tin thành công');
        await fetchProfile(); // Refresh profile data
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      message.error(
        error.response?.data?.message || 'Cập nhật thông tin thất bại',
      );
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePassword = async (values: any) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('Mật khẩu mới và xác nhận mật khẩu không khớp');
      return;
    }

    try {
      setChangingPassword(true);
      const response = await putUpdatePassService({
        oldPassword: values.oldPassword,
        password: values.newPassword,
      });

      if (response.data.statusCode === 200) {
        message.success('Đổi mật khẩu thành công');
        passwordForm.resetFields();
      }
    } catch (error: any) {
      console.error('Error changing password:', error);
      message.error(error.response?.data?.message || 'Đổi mật khẩu thất bại');
    } finally {
      setChangingPassword(false);
    }
  };

  const uploadProps: UploadProps = {
    name: 'avatar',
    action: '/api/upload', // Update with your upload endpoint
    headers: {
      authorization: 'authorization-text',
    },
    onChange(info) {
      if (info.file.status === 'done') {
        message.success(`${info.file.name} file uploaded successfully`);
        // Update avatar URL here
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-page-container">
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '400px',
            }}
          >
            <Spin size="large" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-page-container">
        <h1 className="profile-page-title">Thông tin cá nhân</h1>

        <div className="profile-content">
          {/* Profile Header Card */}
          <Card className="profile-header-card">
            <div className="profile-header">
              <div className="profile-avatar-section">
                <Avatar
                  size={120}
                  src={userProfile?.avatarUrl}
                  icon={<UserOutlined />}
                  className="profile-avatar"
                />
                <Upload {...uploadProps} showUploadList={false}>
                  <Button
                    icon={<CameraOutlined />}
                    className="avatar-upload-button"
                  >
                    Đổi ảnh đại diện
                  </Button>
                </Upload>
              </div>
              <div className="profile-info-section">
                <h2 className="profile-name">{userProfile?.fullName}</h2>
                <p className="profile-email">{userProfile?.email}</p>
                <div className="profile-meta">
                  <span className="profile-meta-item">
                    Mã người dùng: {userProfile?.userCode}
                  </span>
                  <span className="profile-meta-item">
                    Vai trò: {userProfile?.userProfiles.join(', ')}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Tabs for Profile and Password */}
          <Card className="profile-form-card">
            <Tabs defaultActiveKey="profile" type="card">
              <TabPane tab="Thông tin cá nhân" key="profile">
                <Form
                  form={profileForm}
                  layout="vertical"
                  onFinish={handleUpdateProfile}
                  className="profile-form"
                >
                  <div className="form-row">
                    <Form.Item
                      label="Họ và tên"
                      name="fullName"
                      rules={[
                        { required: true, message: 'Vui lòng nhập họ và tên' },
                      ]}
                    >
                      <Input placeholder="Nhập họ và tên" size="large" />
                    </Form.Item>
                  </div>

                  <div className="form-row">
                    <Form.Item
                      label="Số điện thoại"
                      name="phoneNumber"
                      rules={[
                        {
                          required: true,
                          message: 'Vui lòng nhập số điện thoại',
                        },
                      ]}
                    >
                      <Input placeholder="Nhập số điện thoại" size="large" />
                    </Form.Item>
                  </div>

                  <div className="form-row">
                    <Form.Item label="Địa chỉ" name="address">
                      <Input placeholder="Nhập địa chỉ" size="large" />
                    </Form.Item>
                  </div>

                  <div className="form-row form-row-2">
                    <Form.Item label="Giới tính" name="gender">
                      <Select placeholder="Chọn giới tính" size="large">
                        <Option value="MALE">Nam</Option>
                        <Option value="FEMALE">Nữ</Option>
                        <Option value="OTHER">Khác</Option>
                      </Select>
                    </Form.Item>

                    <Form.Item label="Quốc tịch" name="national">
                      <Select placeholder="Chọn quốc tịch" size="large">
                        <Option value="VIETNAM">Việt Nam</Option>
                        <Option value="JAPAN">Nhật Bản</Option>
                      </Select>
                    </Form.Item>
                  </div>

                  <div className="form-row form-row-2">
                    <Form.Item label="Trình độ" name="level">
                      <Select placeholder="Chọn trình độ" size="large">
                        <Option value="N1">N1</Option>
                        <Option value="N2">N2</Option>
                        <Option value="N3">N3</Option>
                        <Option value="N4">N4</Option>
                        <Option value="N5">N5</Option>
                      </Select>
                    </Form.Item>

                    <Form.Item label="Ngày sinh" name="birthday">
                      <DatePicker
                        placeholder="Chọn ngày sinh"
                        size="large"
                        style={{ width: '100%' }}
                        format="DD/MM/YYYY"
                      />
                    </Form.Item>
                  </div>

                  <Form.Item
                    name="userProfiles"
                    hidden
                    initialValue={userProfile?.userProfiles[0] || 'STUDENT'}
                  >
                    <Input />
                  </Form.Item>

                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      size="large"
                      loading={updating}
                      className="submit-button"
                    >
                      Cập nhật thông tin
                    </Button>
                  </Form.Item>
                </Form>
              </TabPane>

              <TabPane tab="Đổi mật khẩu" key="password">
                <Form
                  form={passwordForm}
                  layout="vertical"
                  onFinish={handleChangePassword}
                  className="password-form"
                >
                  <Form.Item
                    label="Mật khẩu hiện tại"
                    name="oldPassword"
                    rules={[
                      {
                        required: true,
                        message: 'Vui lòng nhập mật khẩu hiện tại',
                      },
                    ]}
                  >
                    <Input.Password
                      placeholder="Nhập mật khẩu hiện tại"
                      size="large"
                      iconRender={visible =>
                        visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
                      }
                    />
                  </Form.Item>

                  <Form.Item
                    label="Mật khẩu mới"
                    name="newPassword"
                    rules={[
                      { required: true, message: 'Vui lòng nhập mật khẩu mới' },
                      {
                        min: 6,
                        message: 'Mật khẩu phải có ít nhất 6 ký tự',
                      },
                    ]}
                  >
                    <Input.Password
                      placeholder="Nhập mật khẩu mới"
                      size="large"
                      iconRender={visible =>
                        visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
                      }
                    />
                  </Form.Item>

                  <Form.Item
                    label="Xác nhận mật khẩu mới"
                    name="confirmPassword"
                    dependencies={['newPassword']}
                    rules={[
                      {
                        required: true,
                        message: 'Vui lòng xác nhận mật khẩu mới',
                      },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (
                            !value ||
                            getFieldValue('newPassword') === value
                          ) {
                            return Promise.resolve();
                          }
                          return Promise.reject(
                            new Error('Mật khẩu xác nhận không khớp'),
                          );
                        },
                      }),
                    ]}
                  >
                    <Input.Password
                      placeholder="Nhập lại mật khẩu mới"
                      size="large"
                      iconRender={visible =>
                        visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
                      }
                    />
                  </Form.Item>

                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      size="large"
                      loading={changingPassword}
                      className="submit-button"
                    >
                      Đổi mật khẩu
                    </Button>
                  </Form.Item>
                </Form>
              </TabPane>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
