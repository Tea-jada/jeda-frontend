import React, { useState } from 'react';

function SignupAgreement({ onAgree }) {
  const [allChecked, setAllChecked] = useState(false);
  const [checked, setChecked] = useState({
    terms: false,
    privacy: false,
    thirdParty: false,
    marketing: false,
  });

  const handleAll = (e) => {
    const checked = e.target.checked;
    setAllChecked(checked);
    setChecked({
      terms: checked,
      privacy: checked,
      thirdParty: checked,
      marketing: checked,
    });
  };

  const handleCheck = (e) => {
    const { name, checked: isChecked } = e.target;
    setChecked((prev) => {
      const updated = { ...prev, [name]: isChecked };
      setAllChecked(Object.values(updated).every(Boolean));
      return updated;
    });
  };

  const canProceed = checked.terms && checked.privacy && checked.thirdParty;

  return (
    <div className="signup-agreement" style={{ maxWidth: 600, margin: '40px auto', padding: 24, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
      <h2 style={{ marginBottom: 24 }}>회원가입 약관 동의</h2>
      <div style={{ marginBottom: 16, borderBottom: '1px solid #eee', paddingBottom: 16 }}>
        <label style={{ fontWeight: 'bold', fontSize: 18 }}>
          <input type="checkbox" checked={allChecked} onChange={handleAll} style={{ marginRight: 8 }} />
          모두 동의합니다.
        </label>
        <div style={{ color: '#888', fontSize: 14, marginTop: 4 }}>
          약관, 개인정보 수집 및 이용 안내, 제3자 정보제공, 서비스 홍보 및 마케팅 활용에 모두 동의
        </div>
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontWeight: 'bold' }}>
          <input type="checkbox" name="terms" checked={checked.terms} onChange={handleCheck} style={{ marginRight: 8 }} />
          이용약관 동의 (필수)
        </label>
        <div style={{ background: '#f9f9f9', padding: 12, marginTop: 8, fontSize: 14, maxHeight: 120, overflowY: 'auto', border: '1px solid #eee', borderRadius: 4 }}>
          <b>제 1 조 목적</b><br />
          이 약관은 제다(이하 회사)가 제공하는 모든 서비스(이하 서비스)를 이용하는 고객(이하 회원)과 회사가 서비스의 이용조건 및 절차, 권리와 의무, 기타 필요한 사항을 규정함을 목적으로 합니다.<br /><br />
          <b>제 2 조 약관의 효력과 변경</b><br />
          1. 서비스는 본 약관에 규정된 조항을 회원이 수락하는 것을 조건으로 제공되며 회원이 회원가입시 "동의" 단추를 누름과 동시에 이 약관에 동의하는 것으로 간주됩니다.<br />
          2. 이 약관은 온라인을 통해 공시함으로써 효력을 발생합니다.<br />
          3. 회사는 불가피한 변경의 사유가 있을 때 약관을 임의로 변경할 권한을 가지며 변경된 약관은 온라인을 통해 공지됨으로써 효력이 발생됩니다.<br />
          4. 회원은 변경된 약관에 동의하지 않을 경우 탈퇴를 요청할 수 있으며 변경된 약관의 효력발생일 이후에도 계속적으로 서비스를 이용하는 경우에는 회원이 약관의 변경 사항에 동의한 것으로 봅니다.<br />
          {/* ... 이하 생략, 실제 서비스에서는 전체 약관을 모두 표기해야 함 ... */}
        </div>
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontWeight: 'bold' }}>
          <input type="checkbox" name="privacy" checked={checked.privacy} onChange={handleCheck} style={{ marginRight: 8 }} />
          개인정보 수집 및 이용 동의 (필수)
        </label>
        <div style={{ background: '#f9f9f9', padding: 12, marginTop: 8, fontSize: 14, maxHeight: 120, overflowY: 'auto', border: '1px solid #eee', borderRadius: 4 }}>
          회원님의 개인정보는 비밀번호에 의해 보호되고 있습니다. 회사는 개인정보보호를 위한 기술적 관리적 대책을 시행하고 있습니다.<br />
          {/* ... 실제 서비스에서는 전체 개인정보 수집 및 이용 내용을 모두 표기해야 함 ... */}
        </div>
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontWeight: 'bold' }}>
          <input type="checkbox" name="thirdParty" checked={checked.thirdParty} onChange={handleCheck} style={{ marginRight: 8 }} />
          제3자 정보제공 동의 (필수)
        </label>
        <div style={{ background: '#f9f9f9', padding: 12, marginTop: 8, fontSize: 14, maxHeight: 80, overflowY: 'auto', border: '1px solid #eee', borderRadius: 4 }}>
          회사는 서비스와 관련하여 수집된 회원의 개인정보를 본인의 사전 승낙없이 제3자에게 공개 또는 배포할 수 없습니다. 다만 관련 법령에 의한 관계기관의 요구가 있을 경우 그러하지 아니합니다.
        </div>
      </div>
      <div style={{ marginBottom: 24 }}>
        <label style={{ fontWeight: 'bold' }}>
          <input type="checkbox" name="marketing" checked={checked.marketing} onChange={handleCheck} style={{ marginRight: 8 }} />
          서비스 홍보 및 마케팅 활용 동의 (선택)
        </label>
        <div style={{ background: '#f9f9f9', padding: 12, marginTop: 8, fontSize: 14, maxHeight: 80, overflowY: 'auto', border: '1px solid #eee', borderRadius: 4 }}>
          이벤트 등 프로모션 알림 메일 수신에 동의합니다.
        </div>
      </div>
      <button
        style={{ width: '100%', padding: '12px 0', background: canProceed ? '#2d7a2d' : '#ccc', color: '#fff', border: 'none', borderRadius: 4, fontSize: 16, fontWeight: 'bold', cursor: canProceed ? 'pointer' : 'not-allowed' }}
        disabled={!canProceed}
        onClick={onAgree}
      >
        다음 (회원가입)
      </button>
    </div>
  );
}

export default SignupAgreement; 