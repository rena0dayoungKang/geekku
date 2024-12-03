import styles from './InteriorAnswer.module.scss';
import icon from '../../../assets/images/usericon.png';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import axios from 'axios';
import { url } from 'lib/axios';
import { useAtomValue } from 'jotai';
import { tokenAtom, userAtom } from 'store/atoms';

const InteriorAnswer = () => {
  const [requestInfo, setRequestInfo] = useState({});

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const user = useAtomValue(userAtom);
  const token = useAtomValue(tokenAtom);

  const { num } = useParams();

  useEffect(() => {
    const param = { id: user.userId, num: num };
    axios
      .post(`${url}/requestDetail`, param)
      .then((res) => {
        console.log(res.data);
        setRequestInfo({ ...res.data.requestInfo });
      })
      .catch((err) => {
        console.log(err);
      });
  }, [user]);

  return (
    <div className={styles.all}>
      <div className={styles.title}>인테리어 문의 내역</div>
      <div>
        <div className={styles.semiTitle}>신청자</div>
        <div className={styles.user}>
          <img
            src={requestInfo.profileImage}
            alt="유저아이콘"
            style={{ height: '30px' }}
          />
          <div className={styles.nameInfo}>
            <p id={styles.name}>{requestInfo.name}</p>
            <p id={styles.info}>{requestInfo.phone}</p>
            <p className={styles.upDate}>{formatDate(requestInfo.createdAt)}</p>
          </div>
        </div>
        <div className={styles.line}></div>
        <div className={styles.sectionWrap}>
          <div className={styles.semiTitle}>인테리어 조건 정보</div>
          <div className={styles.line}></div>
          <div>
            <ul>
              <li>
                <span className={styles.category}>건물유형</span>
                <span>{requestInfo.type}</span>
              </li>
              <li>
                <span className={styles.category}>희망 평수</span>
                <span>{requestInfo.size}</span>
              </li>
              <li>
                <span className={styles.category}>시공 희망 일자</span>
                <span>{requestInfo.period}</span>
              </li>
              <li>
                <span className={styles.category}>공간 상황</span>
                <span>{requestInfo.status}</span>
              </li>
              <li>
                <span className={styles.category}>희망 통화시간</span>
                <span>{requestInfo.allowTime}</span>
              </li>
            </ul>
          </div>
          <div className={styles.sectionWrap}>
            <div className={styles.semiTitle}>추가 요구사항</div>
            <div className={styles.line}></div>
            <div className={styles.contentDeco}>
              <span className={styles.content}>상세 내용</span>
              <textarea readOnly value={requestInfo.content || ''}></textarea>
            </div>
          </div>
        </div>
      </div>
      <button>목록으로</button>
    </div>
  );
};

export default InteriorAnswer;
