pragma solidity ^0.4.24;

import "@aragon/os/contracts/apm/APMRegistry.sol";
import "@aragon/os/contracts/apm/APMRegistry.sol";
import "@aragon/os/contracts/factory/DAOFactory.sol";
import "@aragon/os/contracts/kernel/Kernel.sol";
import "@aragon/os/contracts/acl/ACL.sol";
import "@aragon/os/contracts/lib/ens/ENS.sol";
import "@aragon/os/contracts/lib/ens/PublicResolver.sol";


import "@aragon/apps-shared-minime/contracts/MiniMeToken.sol";
import "@aragon/apps-finance/contracts/Finance.sol";
import "@aragon/apps-token-manager/contracts/TokenManager.sol";
import "@aragon/apps-vault/contracts/Vault.sol";
import "@aragon/apps-voting/contracts/Voting.sol";

import "./Althea.sol";

contract AltheaDAOFactory {
  APMRegistry apm;
  DAOFactory fac;
  MiniMeToken minime;

  address constant ANY_ENTITY = address(-1);

  event DeployInstance(address dao);
  event InstalledApp(address appProxy, bytes32 appId);

  constructor (DAOFactory _fac, MiniMeToken _minime, APMRegistry _apm) public {
    apm = _apm;
    fac = _fac;
    minime = _minime;
  }

  function apmInit(
    address financeBase,
    bytes financeContentURI,
    address tokenManagerBase,
    bytes tokenManagerContentURI,
    address vaultBase,
    bytes vaultContentURI,
    address votingBase,
    bytes votingContentURI,
    address altheaBase,
    bytes altheaContentURI
  ) 
    public
  {
    createRepo("althea", altheaBase, altheaContentURI);
    createRepo("finance", financeBase, financeContentURI);
    createRepo("token-manager", tokenManagerBase, tokenManagerContentURI);
    createRepo("vault", financeBase, financeContentURI);
    createRepo("voting", votingBase, vaultContentURI);
  }

  function createInstance() public {
    Kernel dao = fac.newDAO(ANY_ENTITY);
    ACL acl = ACL(dao.acl());
    acl.createPermission(ANY_ENTITY, dao, dao.APP_MANAGER_ROLE(), msg.sender);

    Finance finance = Finance(
      dao.newAppInstance(financeAppId(), latestVersionAppBase(finance.appId()))
    );

    TokenManager tokenManager = TokenManager(
      dao.newAppInstance(financeAppId(), latestVersionAppBase(financeAppId()))
    );

    Vault vault = Vault(
      dao.newAppInstance(vaultAppId(), latestVersionAppBase(vaultAppId()))
    );

    Voting voting = Voting(
      dao.newAppInstance(votingAppId(), latestVersionAppBase(votingAppId()))
    );


    Althea althea = Althea(
      dao.newAppInstance(altheaAppId(), latestVersionAppBase(altheaAppId()))
    );


    MiniMeToken token = minime.createCloneToken(
      "DevToken",
      18,
      "XDT",
      0,
      true
    );


    Vault vaultBase = Vault(latestVersionAppBase(vaultAppId()));
    vault.initialize();

    finance.initialize(vault, uint64(-1) - uint64(now));

    token.changeController(tokenManager);
    uint maxTokens = 100;
    tokenManager.initialize(token, true, maxTokens);

    uint256 pct = 10**16;
    voting.initialize(token, 50 * pct, 15 * pct, 24 hours);

    uint perBlockFee = 10^10;
    althea.initialize(address(vault), perBlockFee);

    //finance permissions
    acl.createPermission(ANY_ENTITY, finance, finance.CREATE_PAYMENTS_ROLE(), msg.sender);
    acl.createPermission(ANY_ENTITY, finance, finance.CHANGE_PERIOD_ROLE(), msg.sender);
    acl.createPermission(ANY_ENTITY, finance, finance.CHANGE_BUDGETS_ROLE(), msg.sender);
    acl.createPermission(ANY_ENTITY, finance, finance.EXECUTE_PAYMENTS_ROLE(), msg.sender);
    acl.createPermission(ANY_ENTITY, finance, finance.DISABLE_PAYMENTS_ROLE(), msg.sender);
    emit InstalledApp(finance, financeAppId());

  
    //token manager permissions
    acl.createPermission(ANY_ENTITY, tokenManager, tokenManager.MINT_ROLE(), msg.sender);
    acl.createPermission(ANY_ENTITY, tokenManager, tokenManager.ISSUE_ROLE(), msg.sender);
    acl.createPermission(ANY_ENTITY, tokenManager, tokenManager.ASSIGN_ROLE(), msg.sender);
    acl.createPermission(ANY_ENTITY, tokenManager, tokenManager.REVOKE_VESTINGS_ROLE(), msg.sender);
    emit InstalledApp(tokenManager, tokenManagerAppId());

    // vault permissions
    acl.createPermission(finance, vault, vault.TRANSFER_ROLE(), this);
    acl.grantPermission(voting, vault, vault.TRANSFER_ROLE());
    acl.setPermissionManager(msg.sender, vault, vault.TRANSFER_ROLE());
    emit InstalledApp(vault, vaultAppId());

    //voting permissions
    acl.createPermission(ANY_ENTITY, voting, voting.CREATE_VOTES_ROLE(), msg.sender);
    acl.createPermission(ANY_ENTITY, voting, voting.MODIFY_QUORUM_ROLE(), msg.sender);
    emit InstalledApp(voting, votingAppId());

    //althea permissions
    acl.createPermission(ANY_ENTITY, althea, althea.ADD_MEMBER(), msg.sender);
    acl.createPermission(ANY_ENTITY, althea, althea.DELETE_MEMBER(), msg.sender);
    acl.createPermission(ANY_ENTITY, althea, althea.MANAGE_ESCROW(), msg.sender);
    emit InstalledApp(althea, altheaAppId());

    emit DeployInstance(dao);
  }
  
  function createRepo(string name, address votingBase, bytes votingContentURI) internal {
    uint16[3] memory firstVersion;
    firstVersion[0] = 1;
    apm.newRepoWithVersion(name, ANY_ENTITY, firstVersion, votingBase, votingContentURI);
  }

  function financeAppId() public view returns (bytes32) {
    return keccak256(apm.registrar().rootNode(), keccak256("finance"));
  }
  function tokenManagerAppId() public view returns (bytes32) {
    return keccak256(apm.registrar().rootNode(), keccak256("token-manager"));
  }
  function vaultAppId() public view returns (bytes32) {
    return keccak256(apm.registrar().rootNode(), keccak256("vault"));
  }
  function votingAppId() public view returns (bytes32) {
    return keccak256(apm.registrar().rootNode(), keccak256("voting"));
  }
  function altheaAppId() public view returns (bytes32) {
    return keccak256(apm.registrar().rootNode(), keccak256("althea"));
  }

  function ens() internal view returns (AbstractENS) {
    return apm.registrar().ens();
  }

  function latestVersionAppBase(bytes32 appId) internal view returns (address base) {
    Repo repo = Repo(PublicResolver(ens().resolver(appId)).addr(appId));
    (,base,) = repo.getLatest();
    return base;
  }


}
