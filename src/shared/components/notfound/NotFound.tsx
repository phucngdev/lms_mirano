import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';

export function NotFound() {
  const navigate = useNavigate();
  return (
    <Result
      status="404"
      title="404"
      subTitle="Trang không tồn tại"
      extra={
        <Button type="primary" onClick={() => navigate('/')}>
          Trang chủ
        </Button>
      }
    />
  );
}
