import loginLogo from 'assets/images/login/loginLogo.png';
import kakaoIcon from 'assets/images/login/kakao_login_Btn.png';
import naverIcon from 'assets/images/login/naver_login_Btn.png';
import googleIcon from 'assets/images/login/google_login_Btn.png';
import styles from 'components/login/Login.module.scss';
import ToggleSwitch from 'components/login/toggleSwitch/ToggleSwitch';
import { url } from 'lib/axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { userAtom, tokenAtom, fcmTokenAtom, alarmsAtom } from 'store/atoms';
import axios from 'axios';
import { type } from '@testing-library/user-event/dist/type';

const Login = () => {
  const [isChecked, setIsChecked] = useState(false);
  const [member, setMember] = useState({ username: '', password: '' });

  const [user, setUser] = useAtom(userAtom);
  const [token, setToken] = useAtom(tokenAtom);
  const setAlarms = useSetAtom(alarmsAtom);
  const fcmToken = useAtomValue(fcmTokenAtom);

  const navigate = useNavigate();
  const handleToggle = (checked) => {
    console.log('토글 상태 변경 : ', checked);
    setIsChecked(checked);
  };

  const edit = (e) => {
    setMember({ ...member, [e.target.name]: e.target.value });
  };

  const submit = () => {
    console.log('submit 함수 호출됨');
    const formData = new FormData();
    formData.append('username', member.username);
    formData.append('password', member.password);

    axios
      .post(`${url}/login`, formData, {
        headers: {
          'Content-type': 'multipart/form-data',
        },
      })
      .then((res) => {
        const token = res.headers.authorization;
        setToken(token);

        const typeEndPoint = isChecked
          ? '/company/companyInfo'
          : '/user/userInfo';
        console.log('요청 엔드포인트 :', typeEndPoint);

        //로그인 성공 후 사용자 정보 가져오기
        axios
          .get(`${url}${typeEndPoint}`, {
            headers: { Authorization: token },
          })
          .then((res) => {
            setUser(res.data);

            if (isChecked) {
              alert('로그인 성공, [기업]사용자');
            } else {
              alert('로그인 성공, [개인]사용자');
              axios
                .post(
                  `${url}/fcmToken`,
                  {
                    userId: res.data.userId, //username: member.username, fcmToken: fcmToken,
                    fcmToken:
                      'eJYgw-DpnP9cgnujFeU6Nm:APA91bHLOZT7rEanQvhcv0I_LyH5m0O-VriDqGZmG3O90qnP3MvcVqfLFqZpZ6aShUpzuStxOAsBOM6bvl8J8Rjrs71EWKFcZWPmFT2GLZx79O9xN9QgCd0',
                    type: 'user',
                  },
                  {
                    headers: {
                      Authorization: token,
                    },
                  }
                )
                .then(() => {
                  // **알림 데이터 가져오기 추가**
                  axios
                    .post(
                      `${url}/userAlarms`,
                      { userId: res.data.userId },
                      {
                        headers: {
                          Authorization: token,
                        },
                      }
                    )
                    .then((alarmResponse) => {
                      if (alarmResponse.data.length !== 0) {
                        console.log(alarmResponse.data);
                        setAlarms(alarmResponse.data); // 알림 데이터 저장
                      }
                      // 로그인 완료 후 메인 화면으로 이동
                      navigate('/');
                    })
                    .catch((error) => {
                      console.error('알림 데이터 가져오기 실패:', error);
                    });
                })
                .catch((error) => {
                  console.error('FCM 토큰 전송 실패:', error);
                });
            }

            navigate('/');
          })
          .catch((err) => {
            console.error(`${isChecked ? '기업' : '개인'}정보 가져오기 실패`);
            alert(`${isChecked ? '기업' : '개인'} 사용자가 없습니다`);
          });
      })
      .catch((err) => {
        console.error('로그인 실패 : ', err);
        alert('로그인 실패');
      });
  };

  const onEnterKey = (e) => {
    if (e.key === 'Enter') {
      submit();
    }
  };

  return (
    <div className={styles.login}>
      <img src={loginLogo} alt="로그인로고" className={styles.logo} />

      {/* 토글 */}
      <div className={styles.toggleContainer}>
        <ToggleSwitch isChecked={isChecked} onToggle={handleToggle} />
      </div>

      <div>
        <input
          type="text"
          name="username"
          id="username"
          onChange={edit}
          placeholder="아이디를 입력하세요."
          className={styles.input}
        />
        <input
          type="password"
          name="password"
          id="password"
          onChange={edit}
          onKeyDown={onEnterKey}
          placeholder="비밀번호를 입력하세요."
          className={styles.input}
        />
        <br />
        <br />
        <button className={styles.button} onClick={submit}>
          로그인
        </button>
        <button
          className={styles.button}
          onClick={() => navigate('/JoinPerson')}
        >
          회원가입
        </button>
        <button
          className={styles.button}
          onClick={() => navigate('/JoinCompany')}
        >
          기업 회원가입
        </button>
      </div>

      <div className={styles.divider1}>
        <a href="/searchId" className={styles.divider1a}>
          아이디를 잊으셨나요?
        </a>
        &nbsp;&nbsp;|&nbsp;&nbsp;
        <a href="/searchPwd" className={styles.divider1a}>
          비밀번호를 잊으셨나요?
        </a>
      </div>

      <hr className={styles.line} />
      {!isChecked && (
        <div className={styles.divider2}>
          SNS로 간편 로그인 / 회원가입
          <div className={styles.iconContainer}>
            <img src={kakaoIcon} alt="카카오 로그인" className={styles.icon} />
            <img src={naverIcon} alt="네이버 로그인" className={styles.icon} />
            <img src={googleIcon} alt="구글 로그인" className={styles.icon} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
